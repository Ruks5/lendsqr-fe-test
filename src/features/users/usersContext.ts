import { createContext } from 'react';
import type { User, UserStatus } from '@/types/user';

export type UsersState =
  | { status: 'loading'; users: null; error: null }
  | { status: 'success'; users: User[]; error: null }
  | { status: 'error'; users: null; error: string };

export interface UsersContextValue {
  state: UsersState;
  /** Re-runs the request, e.g. from an error state's "Try again" button. */
  reload: () => void;
  /** Applies a status change and persists it locally. */
  setUserStatus: (id: string, status: UserStatus) => void;
}

export const UsersContext = createContext<UsersContextValue | null>(null);
