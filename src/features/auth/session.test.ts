import { describe, expect, it } from 'vitest';
import { loadSession, nameFromEmail, signIn, signOut } from './session';
import { saveUserDetails, loadUserDetails, loadStatusOverrides, saveStatusOverrides } from '@/lib/storage';
import { makeUser } from '@/test/fixtures';

describe('session', () => {
  it('derives a display name from the email', () => {
    expect(nameFromEmail('adedeji.okafor@lendsqr.com')).toBe('Adedeji');
    expect(nameFromEmail('GRACE@x.com')).toBe('Grace');
  });

  it('signs in and persists the session', async () => {
    const session = await signIn({ email: 'a@lendsqr.com', password: 'password123' }, 0);
    expect(loadSession()).toEqual(session);
  });

  it('refuses invalid credentials', async () => {
    await expect(signIn({ email: 'bad', password: 'x' }, 0)).rejects.toThrow(/invalid/i);
    expect(loadSession()).toBeNull();
  });

  it('treats an expired session as signed out', () => {
    window.localStorage.setItem('lendsqr:session', JSON.stringify({ email: 'a@b.co', name: 'A', expiresAt: 1 }));
    expect(loadSession()).toBeNull();
    expect(window.localStorage.getItem('lendsqr:session')).toBeNull();
  });

  it('clears cached personal data on sign out but keeps status changes', async () => {
    await signIn({ email: 'a@lendsqr.com', password: 'password123' }, 0);
    saveUserDetails(makeUser({ id: '1' }));
    saveStatusOverrides({ '1': 'Blacklisted' });

    signOut();
    expect(loadSession()).toBeNull();
    expect(loadUserDetails('1')).toBeNull();
    expect(loadStatusOverrides()).toEqual({ '1': 'Blacklisted' });
  });
});
