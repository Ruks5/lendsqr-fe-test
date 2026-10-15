import { screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { mockUsersApi, renderApp, signInForTest } from '@/test/renderApp';
import { jsonResponse, makeUsers } from '@/test/fixtures';

const rows = () => screen.getAllByRole('row').slice(1); // drop the header row

describe('UsersPage', () => {
  beforeEach(() => signInForTest());

  it('shows a loading state, then the first page of users and the stats', async () => {
    // Hold the response so the loading state is observable.
    let respond: (r: Response) => void = () => {};
    const fetchMock = mockUsersApi([]);
    fetchMock.mockImplementation(() => new Promise<Response>((resolve) => (respond = resolve)));
    renderApp('/users');

    expect(await screen.findByRole('table')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('list', { name: 'User summary' })).toHaveAttribute('aria-busy', 'true');

    respond(
      jsonResponse(
        makeUsers(25, (i) => ({ status: i < 5 ? 'Active' : 'Pending', hasLoan: i < 10, hasSavings: false })),
      ),
    );
    await screen.findByText('Grace Effiom 1');
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'false');

    expect(rows()).toHaveLength(10);
    const summary = screen.getByRole('list', { name: 'User summary' });
    const values = within(summary)
      .getAllByRole('listitem')
      .map((li) => li.lastChild?.textContent);
    expect(values).toEqual(['25', '5', '10', '0']);
    expect(screen.getByText('out of 25')).toBeInTheDocument();
  });

  it('paginates and changes page size', async () => {
    mockUsersApi(makeUsers(25));
    const { user } = renderApp('/users');
    await screen.findByText('Grace Effiom 1');

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(rows()).toHaveLength(5);
    expect(screen.getByText('Grace Effiom 21')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();

    await user.selectOptions(screen.getByLabelText('Showing'), '50');
    expect(rows()).toHaveLength(25);
  });

  it('filters by status through the filter panel', async () => {
    mockUsersApi(makeUsers(12, (i) => ({ status: i % 3 === 0 ? 'Blacklisted' : 'Active' })));
    const { user } = renderApp('/users');
    await screen.findByText('Grace Effiom 1');

    await user.click(screen.getByRole('button', { name: 'Filter users' }));
    const panel = screen.getByRole('dialog', { name: 'Filter users' });
    await user.selectOptions(within(panel).getByLabelText('Status'), 'Blacklisted');
    await user.click(within(panel).getByRole('button', { name: 'Filter' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(rows()).toHaveLength(4);
    rows().forEach((row) => expect(within(row).getByText('Blacklisted')).toBeInTheDocument());
  });

  it('closes the filter panel on Escape and returns focus to its trigger', async () => {
    mockUsersApi(makeUsers(3));
    const { user } = renderApp('/users');
    await screen.findByText('Grace Effiom 1');

    const trigger = screen.getByRole('button', { name: 'Filter users' });
    await user.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('shows an empty state when filters match nothing, and can clear them', async () => {
    mockUsersApi(makeUsers(3));
    const { user } = renderApp('/users?username=nobody');

    expect(await screen.findByText('No users match your filters')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(rows()).toHaveLength(3);
  });

  it('shows an empty state when the API returns no users', async () => {
    mockUsersApi([]);
    renderApp('/users');
    expect(await screen.findByText('No users yet')).toBeInTheDocument();
  });

  it('shows an error state and recovers on retry', async () => {
    const fetchMock = mockUsersApi(new TypeError('Failed to fetch'));
    const { user } = renderApp('/users');

    expect(await screen.findByText('We couldn’t load users')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/couldn’t reach the server/i);

    fetchMock.mockImplementation(() => Promise.resolve(new Response(JSON.stringify(makeUsers(2)))));
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Grace Effiom 1')).toBeInTheDocument();
  });

  it('blacklists a user from the row menu after confirmation and persists it', async () => {
    mockUsersApi(makeUsers(2, () => ({ status: 'Active' })));
    const { user } = renderApp('/users');
    await screen.findByText('Grace Effiom 1');

    await user.click(screen.getByRole('button', { name: 'Actions for Grace Effiom 1' }));
    const menu = screen.getByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: /activate user/i })).toHaveAttribute('aria-disabled', 'true');
    await user.click(within(menu).getByRole('menuitem', { name: /blacklist user/i }));

    const dialog = screen.getByRole('alertdialog', { name: 'Blacklist user?' });
    await user.click(within(dialog).getByRole('button', { name: 'Blacklist' }));

    const row = screen.getByText('Grace Effiom 1').closest('tr')!;
    expect(within(row).getByText('Blacklisted')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('lendsqr:status-overrides')!)).toEqual({ '1': 'Blacklisted' });
  });

  it('leaves the status unchanged when the confirmation is cancelled', async () => {
    mockUsersApi(makeUsers(1, () => ({ status: 'Active' })));
    const { user } = renderApp('/users');
    await screen.findByText('Grace Effiom 1');

    await user.click(screen.getByRole('button', { name: 'Actions for Grace Effiom 1' }));
    await user.click(screen.getByRole('menuitem', { name: /blacklist user/i }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(within(rows()[0]).getByText('Active')).toBeInTheDocument();
    expect(window.localStorage.getItem('lendsqr:status-overrides')).toBeNull();
  });

  it('saves the user to localStorage and opens details from "View Details"', async () => {
    mockUsersApi(makeUsers(2));
    const { user } = renderApp('/users');
    await screen.findByText('Grace Effiom 2');

    await user.click(screen.getByRole('button', { name: 'Actions for Grace Effiom 2' }));
    await user.click(screen.getByRole('menuitem', { name: /view details/i }));

    expect(await screen.findByRole('heading', { name: 'User Details' })).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('lendsqr:user:2')!).username).toBe('Grace Effiom 2');
  });
});
