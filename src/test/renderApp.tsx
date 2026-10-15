import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AppRoutes } from '@/App';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { ToastProvider } from '@/features/toast/ToastProvider';
import type { User } from '@/types/user';
import { jsonResponse } from './fixtures';

export function signInForTest(email = 'adedeji@lendsqr.com') {
  window.localStorage.setItem(
    'lendsqr:session',
    JSON.stringify({ email, name: 'Adedeji', expiresAt: Date.now() + 60_000 }),
  );
}

/** Stubs the users endpoint. Pass an Error to simulate a network failure. */
export function mockUsersApi(result: User[] | Error | Response) {
  const fetchMock = vi.fn((): Promise<Response> => {
    if (result instanceof Error) return Promise.reject(result);
    if (result instanceof Response) return Promise.resolve(result.clone());
    return Promise.resolve(jsonResponse(result));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** Renders the real route tree at `path`, with all app providers. */
export function renderApp(path: string) {
  const user = userEvent.setup();
  const utils = render(
    <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
  return { user, ...utils };
}
