import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { mockUsersApi, renderApp, signInForTest } from '@/test/renderApp';
import { makeUser, makeUsers } from '@/test/fixtures';
import { saveUserDetails } from '@/lib/storage';

describe('UserDetailsPage', () => {
  beforeEach(() => signInForTest());

  it('renders the user from the API and writes it to localStorage', async () => {
    mockUsersApi([makeUser({ id: '7', username: 'Grace Effiom', status: 'Pending' })]);
    renderApp('/users/7');

    expect(await screen.findByRole('heading', { name: 'Grace Effiom' })).toBeInTheDocument();
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Debby Ogana')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Tier 1 of 3' })).toBeInTheDocument();
    expect(window.localStorage.getItem('lendsqr:user:7')).not.toBeNull();
  });

  it('falls back to the stored copy when the API is unavailable', async () => {
    saveUserDetails(makeUser({ id: '9', profile: { ...makeUser().profile, firstName: 'Stored', lastName: 'Person' } }));
    mockUsersApi(new TypeError('offline'));
    renderApp('/users/9');

    expect(await screen.findByRole('heading', { name: 'Stored Person' })).toBeInTheDocument();
    expect(await screen.findByText(/showing the saved copy/i)).toBeInTheDocument();
  });

  it('shows "User not found" for an unknown id', async () => {
    mockUsersApi(makeUsers(2));
    renderApp('/users/does-not-exist');
    expect(await screen.findByText('User not found')).toBeInTheDocument();
  });

  it('shows an error with retry when nothing is stored and the API fails', async () => {
    mockUsersApi(new Response('nope', { status: 500 }));
    renderApp('/users/1');
    expect(await screen.findByText('We couldn’t load this user')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('disables the action that matches the current status', async () => {
    mockUsersApi([makeUser({ id: '1', status: 'Blacklisted' })]);
    renderApp('/users/1');
    expect(await screen.findByRole('button', { name: 'Blacklist User' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Activate User' })).toBeEnabled();
  });

  it('activates a blacklisted user after confirmation', async () => {
    mockUsersApi([makeUser({ id: '1', status: 'Blacklisted' })]);
    const { user } = renderApp('/users/1');
    await user.click(await screen.findByRole('button', { name: 'Activate User' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Activate' }));

    expect(screen.getByRole('button', { name: 'Activate User' })).toBeDisabled();
    expect(JSON.parse(window.localStorage.getItem('lendsqr:user:1')!).status).toBe('Active');
    expect(await screen.findByText(/has been activated/)).toBeInTheDocument();
  });

  it('switches tabs with the arrow keys', async () => {
    mockUsersApi([makeUser({ id: '1' })]);
    const { user } = renderApp('/users/1');
    const general = await screen.findByRole('tab', { name: 'General Details' });
    expect(general).toHaveAttribute('aria-selected', 'true');

    general.focus();
    await user.keyboard('{ArrowRight}');
    const documents = screen.getByRole('tab', { name: 'Documents' });
    expect(documents).toHaveAttribute('aria-selected', 'true');
    expect(documents).toHaveFocus();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('No documents uploaded');

    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'App and System' })).toHaveAttribute('aria-selected', 'true');
  });
});
