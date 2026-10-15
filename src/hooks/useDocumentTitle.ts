import { useEffect } from 'react';

const APP_NAME = 'Lendsqr Admin';

/** Sets the tab title per page so screen reader users hear where they landed. */
export function useDocumentTitle(title: string | undefined): void {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}
