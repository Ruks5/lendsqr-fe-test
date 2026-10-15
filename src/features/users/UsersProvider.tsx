import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getUsers } from '@/api/users';
import { ApiError, getErrorMessage } from '@/api/http';
import { loadStatusOverrides, saveStatusOverrides, type StatusOverrides } from '@/lib/storage';
import { UsersContext, type UsersState } from './usersContext';
import type { User, UserStatus } from '@/types/user';

type FetchState = { status: 'loading' } | { status: 'success'; users: User[] } | { status: 'error'; error: string };

/**
 * Loads the user list once for the whole signed-in area, so moving between
 * Dashboard, Users and User details doesn't refetch 500 records each time.
 * Status changes are stored as overrides and merged over the API data.
 */
export function UsersProvider({ children }: { children: ReactNode }) {
  const [fetchState, setFetchState] = useState<FetchState>({ status: 'loading' });
  const [overrides, setOverrides] = useState<StatusOverrides>(() => loadStatusOverrides());
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setFetchState({ status: 'loading' });
    getUsers(controller.signal)
      .then((users) => setFetchState({ status: 'success', users }))
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.kind === 'aborted') return;
        setFetchState({ status: 'error', error: getErrorMessage(error) });
      });
    return () => controller.abort();
  }, [requestId]);

  const reload = useCallback(() => setRequestId((n) => n + 1), []);

  const setUserStatus = useCallback((id: string, status: UserStatus) => {
    setOverrides((prev) => {
      const next = { ...prev, [id]: status };
      saveStatusOverrides(next);
      return next;
    });
  }, []);

  const state = useMemo<UsersState>(() => {
    if (fetchState.status === 'loading') return { status: 'loading', users: null, error: null };
    if (fetchState.status === 'error') return { status: 'error', users: null, error: fetchState.error };
    const hasOverrides = Object.keys(overrides).length > 0;
    const users = hasOverrides
      ? fetchState.users.map((u) =>
          overrides[u.id] && overrides[u.id] !== u.status ? { ...u, status: overrides[u.id] } : u,
        )
      : fetchState.users;
    return { status: 'success', users, error: null };
  }, [fetchState, overrides]);

  const value = useMemo(() => ({ state, reload, setUserStatus }), [state, reload, setUserStatus]);
  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}
