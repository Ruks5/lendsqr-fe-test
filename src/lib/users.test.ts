import { describe, expect, it } from 'vitest';
import {
  computeStats,
  filterUsers,
  filtersFromParams,
  filtersToParams,
  getPageRange,
  getTotalPages,
  hasActiveFilters,
  paginate,
  parsePage,
  parsePageSize,
} from './users';
import { makeUser, makeUsers } from '@/test/fixtures';
import { EMPTY_FILTERS } from '@/types/user';

const users = [
  makeUser({
    id: 'a',
    organization: 'Lendsqr',
    username: 'Adedeji',
    email: 'adedeji@lendsqr.com',
    phoneNumber: '08078903721',
    status: 'Inactive',
    dateJoined: '2020-05-15T10:00:00',
  }),
  makeUser({
    id: 'b',
    organization: 'Irorun',
    username: 'Debby Ogana',
    email: 'debby2@irorun.com',
    phoneNumber: '08160780928',
    status: 'Pending',
    dateJoined: '2020-04-30T10:00:00',
  }),
  makeUser({
    id: 'c',
    organization: 'Lendstar',
    username: 'Grace Effiom',
    email: 'grace@lendstar.com',
    phoneNumber: '07060780922',
    status: 'Blacklisted',
    dateJoined: '2020-04-30T12:00:00',
  }),
];

describe('filterUsers', () => {
  it('returns every user when no filter is set', () => {
    expect(filterUsers(users, EMPTY_FILTERS)).toHaveLength(3);
  });

  it('matches organization exactly, ignoring case', () => {
    const result = filterUsers(users, { ...EMPTY_FILTERS, organization: 'lendsqr' });
    expect(result.map((u) => u.id)).toEqual(['a']);
  });

  it('does not treat organization as a substring match', () => {
    expect(filterUsers(users, { ...EMPTY_FILTERS, organization: 'Lend' })).toEqual([]);
  });

  it('matches username and email as case-insensitive substrings', () => {
    expect(filterUsers(users, { ...EMPTY_FILTERS, username: 'ogana' }).map((u) => u.id)).toEqual(['b']);
    expect(filterUsers(users, { ...EMPTY_FILTERS, email: 'LENDSTAR' }).map((u) => u.id)).toEqual(['c']);
  });

  it('compares phone numbers on digits only', () => {
    const result = filterUsers(users, { ...EMPTY_FILTERS, phoneNumber: '0807 890' });
    expect(result.map((u) => u.id)).toEqual(['a']);
  });

  it('matches the calendar day joined', () => {
    const result = filterUsers(users, { ...EMPTY_FILTERS, date: '2020-04-30' });
    expect(result.map((u) => u.id)).toEqual(['b', 'c']);
  });

  it('combines filters with AND', () => {
    const result = filterUsers(users, { ...EMPTY_FILTERS, date: '2020-04-30', status: 'Pending' });
    expect(result.map((u) => u.id)).toEqual(['b']);
  });

  it('searches across name, email, organization and phone with the header query', () => {
    expect(filterUsers(users, { ...EMPTY_FILTERS, q: 'irorun' }).map((u) => u.id)).toEqual(['b']);
    expect(filterUsers(users, { ...EMPTY_FILTERS, q: '0706' }).map((u) => u.id)).toEqual(['c']);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterUsers(users, { ...EMPTY_FILTERS, username: 'nobody-here' })).toEqual([]);
  });

  it('ignores whitespace-only filters', () => {
    expect(hasActiveFilters({ ...EMPTY_FILTERS, username: '   ' })).toBe(false);
    expect(filterUsers(users, { ...EMPTY_FILTERS, username: '   ' })).toHaveLength(3);
  });
});

describe('URL params', () => {
  it('round-trips filters through URLSearchParams', () => {
    const filters = { ...EMPTY_FILTERS, organization: 'Irorun', status: 'Active' as const, date: '2020-04-30' };
    expect(filtersFromParams(filtersToParams(filters))).toEqual(filters);
  });

  it('drops invalid status and date values from the URL', () => {
    const parsed = filtersFromParams(new URLSearchParams('status=Deleted&date=yesterday'));
    expect(parsed.status).toBe('');
    expect(parsed.date).toBe('');
  });

  it('preserves unrelated params such as page size', () => {
    const next = filtersToParams({ ...EMPTY_FILTERS, email: 'x' }, new URLSearchParams('size=50'));
    expect(next.get('size')).toBe('50');
    expect(next.get('email')).toBe('x');
  });
});

describe('pagination helpers', () => {
  it('computes total pages, never fewer than one', () => {
    expect(getTotalPages(500, 10)).toBe(50);
    expect(getTotalPages(501, 100)).toBe(6);
    expect(getTotalPages(0, 10)).toBe(1);
  });

  it('slices the requested page', () => {
    const list = makeUsers(25);
    expect(paginate(list, 3, 10).map((u) => u.id)).toEqual(['21', '22', '23', '24', '25']);
  });

  it('clamps out-of-range and garbage page numbers', () => {
    expect(parsePage('7', 5)).toBe(5);
    expect(parsePage('0', 5)).toBe(1);
    expect(parsePage('-3', 5)).toBe(1);
    expect(parsePage('abc', 5)).toBe(1);
    expect(parsePage(null, 5)).toBe(1);
  });

  it('only accepts supported page sizes', () => {
    expect(parsePageSize('50')).toBe(50);
    expect(parsePageSize('37')).toBe(10);
    expect(parsePageSize(null)).toBe(10);
  });
});

describe('getPageRange', () => {
  it('matches the design for page 1 of 16', () => {
    expect(getPageRange(1, 16)).toEqual([1, 2, 3, 'ellipsis-end', 15, 16]);
  });

  it('shows ellipses on both sides in the middle', () => {
    expect(getPageRange(8, 16)).toEqual([1, 2, 'ellipsis-start', 7, 8, 9, 'ellipsis-end', 15, 16]);
  });

  it('shows the tail without a trailing ellipsis near the end', () => {
    expect(getPageRange(16, 16)).toEqual([1, 2, 'ellipsis-start', 14, 15, 16]);
  });

  it('lists every page when there are few', () => {
    expect(getPageRange(2, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageRange(1, 1)).toEqual([1]);
  });
});

describe('computeStats', () => {
  it('counts totals, active users, loans and savings', () => {
    const list = [
      makeUser({ status: 'Active', hasLoan: true, hasSavings: true }),
      makeUser({ status: 'Active', hasLoan: false, hasSavings: true }),
      makeUser({ status: 'Blacklisted', hasLoan: true, hasSavings: false }),
    ];
    expect(computeStats(list)).toEqual({ total: 3, active: 2, withLoans: 2, withSavings: 2 });
  });

  it('returns zeros for an empty list', () => {
    expect(computeStats([])).toEqual({ total: 0, active: 0, withLoans: 0, withSavings: 0 });
  });
});
