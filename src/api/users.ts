import { ApiError, fetchJson } from './http';
import { USER_STATUSES, type User } from '@/types/user';

const FALLBACK_URL = '/mock/users.json';

export const USERS_API_URL: string = import.meta.env.VITE_USERS_API_URL?.trim() || FALLBACK_URL;

const isString = (v: unknown): v is string => typeof v === 'string';
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Runtime guard for the fields the UI relies on. The mock API is outside
 * our control, so a record that fails this check is dropped instead of
 * crashing a render deep in the table.
 */
export function isUser(value: unknown): value is User {
  if (!isObject(value)) return false;
  const v = value;
  return (
    isString(v.id) &&
    isString(v.organization) &&
    isString(v.username) &&
    isString(v.email) &&
    isString(v.phoneNumber) &&
    isString(v.dateJoined) &&
    !Number.isNaN(Date.parse(v.dateJoined)) &&
    isString(v.status) &&
    (USER_STATUSES as readonly string[]).includes(v.status) &&
    isObject(v.profile) &&
    isObject(v.education) &&
    isObject(v.socials) &&
    isObject(v.bank) &&
    Array.isArray(v.guarantors)
  );
}

export interface ParsedUsers {
  users: User[];
  /** Number of records that failed validation and were dropped. */
  dropped: number;
}

/** Accepts a bare array or a `{ data: [...] }` envelope (mockapi-style). */
export function parseUsers(payload: unknown): ParsedUsers {
  const list = Array.isArray(payload)
    ? payload
    : isObject(payload) && Array.isArray(payload.data)
      ? payload.data
      : null;

  if (!list) {
    throw new ApiError('parse', 'The users endpoint returned data in an unexpected format.');
  }

  const users = list.filter(isUser);
  return { users, dropped: list.length - users.length };
}

export async function getUsers(signal?: AbortSignal): Promise<User[]> {
  const payload = await fetchJson(USERS_API_URL, { signal });
  const { users, dropped } = parseUsers(payload);
  if (dropped > 0 && import.meta.env.DEV) {
    console.warn(`[users] dropped ${dropped} malformed record(s) from the API response`);
  }
  return users;
}
