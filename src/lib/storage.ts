import { isUser } from '@/api/users';
import type { User, UserStatus } from '@/types/user';

/**
 * Thin, defensive wrapper over localStorage.
 *
 * localStorage can throw (Safari private mode, quota exceeded, storage
 * disabled) and can hold stale or hand-edited values, so every read is
 * parsed and validated and every failure falls back to `null`/no-op.
 */
const PREFIX = 'lendsqr:';

export function readJson<T>(key: string, guard?: (v: unknown) => v is T): T | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (guard && !guard(parsed)) return null;
    return parsed as T;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* storage unavailable: nothing to remove */
  }
}

/** Removes every key under `lendsqr:<prefix>`. */
export function removeByPrefix(prefix: string): void {
  try {
    const full = PREFIX + prefix;
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(full))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* storage unavailable */
  }
}

// ---- User details -------------------------------------------------------

const userKey = (id: string) => `user:${id}`;
const RECENT_KEY = 'user:recent';
/** Keep storage bounded: only the most recently viewed users are cached. */
export const MAX_CACHED_USERS = 20;

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');

export function saveUserDetails(user: User): void {
  if (!writeJson(userKey(user.id), user)) return;
  const recent = (readJson(RECENT_KEY, isStringArray) ?? []).filter((id) => id !== user.id);
  recent.unshift(user.id);
  recent.slice(MAX_CACHED_USERS).forEach((id) => removeKey(userKey(id)));
  writeJson(RECENT_KEY, recent.slice(0, MAX_CACHED_USERS));
}

export function loadUserDetails(id: string): User | null {
  const user = readJson(userKey(id), isUser);
  return user && user.id === id ? user : null;
}

// ---- Status changes -----------------------------------------------------

// Stands in for a server-side status change, so it deliberately survives logout.
const STATUS_KEY = 'status-overrides';
export type StatusOverrides = Record<string, UserStatus>;

const isOverrides = (v: unknown): v is StatusOverrides => typeof v === 'object' && v !== null && !Array.isArray(v);

export function loadStatusOverrides(): StatusOverrides {
  return readJson(STATUS_KEY, isOverrides) ?? {};
}

export function saveStatusOverrides(overrides: StatusOverrides): void {
  writeJson(STATUS_KEY, overrides);
}
