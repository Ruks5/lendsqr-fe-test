import { toDateInputValue } from './format';
import { EMPTY_FILTERS, USER_STATUSES, type User, type UserFilters, type UserStatus } from '@/types/user';

// ---- Filtering ----------------------------------------------------------

const normalise = (s: string) => s.trim().toLowerCase();
const digits = (s: string) => s.replace(/\D/g, '');

export function hasActiveFilters(filters: UserFilters): boolean {
  return (Object.keys(EMPTY_FILTERS) as (keyof UserFilters)[]).some((k) => filters[k].trim() !== '');
}

/**
 * Pure filter used by the Users table. Text fields match case-insensitively
 * on a substring; phone numbers compare digits only so "0807 890" still
 * matches "08078903721"; date matches the local calendar day joined.
 */
export function filterUsers(users: readonly User[], filters: UserFilters): User[] {
  if (!hasActiveFilters(filters)) return users as User[];

  const org = normalise(filters.organization);
  const username = normalise(filters.username);
  const email = normalise(filters.email);
  const phone = digits(filters.phoneNumber);
  const q = normalise(filters.q);
  const qDigits = digits(filters.q);

  return users.filter((u) => {
    if (org && normalise(u.organization) !== org) return false;
    if (filters.status && u.status !== filters.status) return false;
    if (username && !normalise(u.username).includes(username)) return false;
    if (email && !normalise(u.email).includes(email)) return false;
    if (filters.phoneNumber.trim() && !digits(u.phoneNumber).includes(phone)) return false;
    if (filters.date && toDateInputValue(u.dateJoined) !== filters.date) return false;
    if (q) {
      const haystack = `${u.username} ${u.email} ${u.organization} ${u.status}`.toLowerCase();
      const phoneHit = qDigits.length >= 3 && digits(u.phoneNumber).includes(qDigits);
      if (!haystack.includes(q) && !phoneHit) return false;
    }
    return true;
  });
}

// ---- URL <-> filters ----------------------------------------------------

const isStatus = (v: string): v is UserStatus => (USER_STATUSES as readonly string[]).includes(v);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Reads filters from the URL, ignoring values that aren't valid. */
export function filtersFromParams(params: URLSearchParams): UserFilters {
  const status = params.get('status') ?? '';
  const date = params.get('date') ?? '';
  return {
    organization: params.get('organization') ?? '',
    username: params.get('username') ?? '',
    email: params.get('email') ?? '',
    phoneNumber: params.get('phoneNumber') ?? '',
    date: DATE_RE.test(date) ? date : '',
    status: isStatus(status) ? status : '',
    q: params.get('q') ?? '',
  };
}

export function filtersToParams(filters: UserFilters, base?: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(base);
  (Object.keys(EMPTY_FILTERS) as (keyof UserFilters)[]).forEach((key) => {
    const value = filters[key].trim();
    if (value) next.set(key, value);
    else next.delete(key);
  });
  return next;
}

// ---- Pagination ---------------------------------------------------------

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 10;

export function parsePageSize(raw: string | null): number {
  const n = Number(raw);
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(n) ? n : DEFAULT_PAGE_SIZE;
}

/** Parses a 1-based page number and clamps it into [1, totalPages]. */
export function parsePage(raw: string | null, totalPages: number): number {
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, Math.max(totalPages, 1));
}

export function getTotalPages(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function paginate<T>(items: readonly T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

/**
 * Page buttons to render, e.g. for page 1 of 16: [1, 2, 3, …, 15, 16].
 * Always shows the first/last `boundary` pages and `siblings` either side
 * of the current page, collapsing gaps into an ellipsis.
 */
export function getPageRange(current: number, total: number, siblings = 1, boundary = 2): PageItem[] {
  const totalNumbers = boundary * 2 + siblings * 2 + 3;
  if (total <= totalNumbers) return Array.from({ length: total }, (_, i) => i + 1);

  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const leftSibling = Math.max(current - siblings, boundary + 2);
  const rightSibling = Math.min(current + siblings, total - boundary - 1);

  const showLeftEllipsis = leftSibling > boundary + 2;
  const showRightEllipsis = rightSibling < total - boundary - 1;

  const items: PageItem[] = range(1, boundary);
  if (showLeftEllipsis) items.push('ellipsis-start');
  else items.push(boundary + 1);

  items.push(
    ...range(showLeftEllipsis ? leftSibling : boundary + 2, showRightEllipsis ? rightSibling : total - boundary - 1),
  );

  if (showRightEllipsis) items.push('ellipsis-end');
  else items.push(total - boundary);

  items.push(...range(total - boundary + 1, total));
  // Remove accidental duplicates at the joins for small totals.
  return items.filter((item, i) => items.indexOf(item) === i);
}

// ---- Stats --------------------------------------------------------------

export interface UserStats {
  total: number;
  active: number;
  withLoans: number;
  withSavings: number;
}

export function computeStats(users: readonly User[]): UserStats {
  let active = 0;
  let withLoans = 0;
  let withSavings = 0;
  for (const u of users) {
    if (u.status === 'Active') active += 1;
    if (u.hasLoan) withLoans += 1;
    if (u.hasSavings) withSavings += 1;
  }
  return { total: users.length, active, withLoans, withSavings };
}

export function countBy<T, K extends string>(items: readonly T[], key: (item: T) => K): Record<K, number> {
  return items.reduce(
    (acc, item) => {
      const k = key(item);
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    },
    {} as Record<K, number>,
  );
}

export function uniqueSorted(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}
