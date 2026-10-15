import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { UsersProvider } from '@/features/users/UsersProvider';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { PageLoader } from './PageLoader';
import styles from './AppLayout.module.scss';

/** Shell for every signed-in page: header, sidebar and the routed page. */
export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // After client-side navigation: close the mobile drawer and move focus to
  // the new page, as a full page load would. Skipped on first load so the
  // skip link stays the first Tab stop.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSidebarOpen(false);
    document.getElementById('main-content')?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  // Escape closes the drawer; the page behind it shouldn't scroll while open.
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSidebarOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.classList.add(styles.noScroll);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove(styles.noScroll);
    };
  }, [sidebarOpen]);

  return (
    <UsersProvider>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <Header sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((o) => !o)} />
      <Sidebar open={sidebarOpen} onNavigate={closeSidebar} />
      {sidebarOpen && <div className={styles.overlay} onClick={closeSidebar} aria-hidden="true" />}
      <main id="main-content" className={styles.main} tabIndex={-1}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </UsersProvider>
  );
}
