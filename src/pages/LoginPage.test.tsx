import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { mockUsersApi, renderApp } from '@/test/renderApp';
import { makeUsers } from '@/test/fixtures';

describe('LoginPage', () => {
  it('shows field errors and does not sign in when the form is empty', async () => {
    const { user } = renderApp('/login');
    await user.click(await screen.findByRole('button', { name: /log in/i }));

    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    expect(screen.getByText('Enter your password')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Email')).toHaveFocus();
    expect(window.localStorage.getItem('lendsqr:session')).toBeNull();
  });

  it('rejects a malformed email and a short password', async () => {
    const { user } = renderApp('/login');
    await user.type(await screen.findByLabelText('Email'), 'adedeji@lendsqr');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
  });

  it('clears a field error as the user edits that field', async () => {
    const { user } = renderApp('/login');
    await user.click(await screen.findByRole('button', { name: /log in/i }));
    await user.type(screen.getByLabelText('Email'), 'a');
    expect(screen.queryByText('Enter your email address')).not.toBeInTheDocument();
    expect(screen.getByText('Enter your password')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const { user } = renderApp('/login');
    const password = await screen.findByLabelText('Password');
    expect(password).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('signs in with valid details and lands on the dashboard', async () => {
    mockUsersApi(makeUsers(3));
    const { user } = renderApp('/login');
    await user.type(await screen.findByLabelText('Email'), 'Adedeji@Lendsqr.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByRole('heading', { name: 'Dashboard' }, { timeout: 3000 })).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('lendsqr:session')!).email).toBe('adedeji@lendsqr.com');
  });

  it('redirects signed-out visitors from a protected page to login', async () => {
    renderApp('/users');
    expect(await screen.findByRole('heading', { name: 'Welcome!' })).toBeInTheDocument();
  });
});
