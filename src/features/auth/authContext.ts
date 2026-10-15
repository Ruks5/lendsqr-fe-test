import { createContext } from 'react';
import type { LoginValues } from '@/lib/validation';

export interface Session {
  email: string;
  name: string;
  expiresAt: number;
}

export interface AuthContextValue {
  session: Session | null;
  login: (values: LoginValues) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
