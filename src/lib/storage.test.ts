import { describe, expect, it, vi } from 'vitest';
import {
  MAX_CACHED_USERS,
  loadStatusOverrides,
  loadUserDetails,
  readJson,
  saveStatusOverrides,
  saveUserDetails,
  writeJson,
} from './storage';
import { makeUser } from '@/test/fixtures';

describe('user details storage', () => {
  it('persists and retrieves a user by id', () => {
    const user = makeUser({ id: '42' });
    saveUserDetails(user);
    expect(loadUserDetails('42')).toEqual(user);
  });

  it('returns null for a user that was never saved', () => {
    expect(loadUserDetails('missing')).toBeNull();
  });

  it('returns null when the stored value is corrupt JSON', () => {
    window.localStorage.setItem('lendsqr:user:7', '{not json');
    expect(loadUserDetails('7')).toBeNull();
  });

  it('returns null when the stored value is not a valid user', () => {
    window.localStorage.setItem('lendsqr:user:8', JSON.stringify({ id: '8', name: 'x' }));
    expect(loadUserDetails('8')).toBeNull();
  });

  it('keeps only the most recently viewed users', () => {
    for (let i = 1; i <= MAX_CACHED_USERS + 3; i += 1) saveUserDetails(makeUser({ id: String(i) }));
    expect(loadUserDetails('1')).toBeNull();
    expect(loadUserDetails('3')).toBeNull();
    expect(loadUserDetails('4')).not.toBeNull();
    expect(loadUserDetails(String(MAX_CACHED_USERS + 3))).not.toBeNull();
  });
});

describe('status overrides', () => {
  it('round-trips overrides', () => {
    saveStatusOverrides({ '1': 'Blacklisted' });
    expect(loadStatusOverrides()).toEqual({ '1': 'Blacklisted' });
  });

  it('falls back to an empty object for invalid data', () => {
    window.localStorage.setItem('lendsqr:status-overrides', '[1,2]');
    expect(loadStatusOverrides()).toEqual({});
  });
});

describe('when localStorage throws', () => {
  it('reads return null and writes report failure instead of crashing', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(readJson('anything')).toBeNull();
    expect(writeJson('anything', 1)).toBe(false);
    expect(() => saveUserDetails(makeUser())).not.toThrow();
  });
});
