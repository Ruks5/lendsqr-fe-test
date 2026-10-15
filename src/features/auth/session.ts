import { readJson, removeByPrefix, removeKey, writeJson } from '@/lib/storage';
import { validateLogin, type LoginValues } from '@/lib/validation';
import type { Session } from './authContext';

const SESSION_KEY = 'session';
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

const isSession = (v: unknown): v is Session =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as Session).email === 'string' &&
  typeof (v as Session).name === 'string' &&
  typeof (v as Session).expiresAt === 'number';

/** "adedeji.okafor@lendsqr.com" -> "Adedeji" */
export function nameFromEmail(email: string): string {
  const first = email.split('@')[0].split(/[._-]/)[0] ?? '';
  return first ? first[0].toUpperCase() + first.slice(1).toLowerCase() : 'User';
}

export function loadSession(now = Date.now()): Session | null {
  const session = readJson(SESSION_KEY, isSession);
  if (!session) return null;
  if (session.expiresAt <= now) {
    removeKey(SESSION_KEY);
    return null;
  }
  return session;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock authentication. There is no real auth backend in scope, so any
 * well-formed email with a password of 8+ characters signs in. The
 * function is async and validates again so swapping in a real API call
 * doesn't change any caller.
 */
export async function signIn(values: LoginValues, latencyMs = 600): Promise<Session> {
  await wait(latencyMs);
  const errors = validateLogin(values);
  if (Object.keys(errors).length > 0) {
    throw new Error('Invalid email or password.');
  }
  const email = values.email.trim().toLowerCase();
  const session: Session = { email, name: nameFromEmail(email), expiresAt: Date.now() + SESSION_TTL_MS };
  writeJson(SESSION_KEY, session);
  return session;
}

export function signOut(): void {
  removeKey(SESSION_KEY);
  // Cached user records contain personal data (BVN, phone numbers), so they
  // shouldn't outlive the session on a shared machine.
  removeByPrefix('user:');
}
