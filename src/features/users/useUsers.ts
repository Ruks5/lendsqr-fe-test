import { useContext, useMemo } from 'react';
import { UsersContext, type UsersContextValue } from './usersContext';
import type { User } from '@/types/user';

export function useUsers(): UsersContextValue {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error('useUsers must be used inside <UsersProvider>');
  return ctx;
}

/** Looks up one user from the loaded list (undefined while loading or if missing). */
export function useUserById(id: string | undefined): User | undefined {
  const { state } = useUsers();
  return useMemo(
    () => (id && state.status === 'success' ? state.users.find((u) => u.id === id) : undefined),
    [id, state],
  );
}
