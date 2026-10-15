import { useCallback, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BriefcaseIcon, ChevronDownIcon, LogoutIcon } from '@/components/icons';
import { useAuth } from '@/features/auth/useAuth';
import { useUsers } from '@/features/users/useUsers';
import { useDismiss } from '@/hooks/useDismiss';
import { useMenuKeyboard } from '@/hooks/useMenuKeyboard';
import { uniqueSorted } from '@/lib/users';
import { SearchForm } from './Header';
import { NAV_SECTIONS } from './navigation';
import styles from './Sidebar.module.scss';

export const APP_VERSION = 'v1.2.0';

interface SidebarProps {
  open: boolean;
  onNavigate: () => void;
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside id="app-sidebar" className={`${styles.sidebar} ${open ? styles.open : ''}`} aria-label="Main navigation">
      <SearchForm className={styles.mobileSearch} id="sidebar-search" />
      <OrganizationSwitcher onSelect={onNavigate} />

      <nav className={styles.nav}>
        {NAV_SECTIONS.map((section, i) => (
          <div key={section.title ?? i} className={styles.section}>
            {section.title && <h2 className={styles.sectionTitle}>{section.title}</h2>}
            <ul>
              {section.items.map(({ label, path, icon: Icon }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    onClick={onNavigate}
                    className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        <button type="button" className={styles.link} onClick={onLogout}>
          <LogoutIcon size={16} />
          <span>Logout</span>
        </button>
        <p className={styles.version}>{APP_VERSION}</p>
      </div>
    </aside>
  );
}

/**
 * "Switch Organization" isn't specified in the design. Here it lists the
 * organisations in the dataset and jumps to Users filtered by the one picked.
 */
function OrganizationSwitcher({ onSelect }: { onSelect: () => void }) {
  const { state } = useUsers();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const onMenuKeyDown = useMenuKeyboard(menuRef);
  const close = useCallback(() => setOpen(false), []);
  useDismiss([wrapperRef], close, open);

  const organizations = state.status === 'success' ? uniqueSorted(state.users.map((u) => u.organization)) : [];

  const choose = (org: string) => {
    setOpen(false);
    onSelect();
    navigate(`/users?organization=${encodeURIComponent(org)}`);
  };

  return (
    <div className={styles.switcher} ref={wrapperRef}>
      <button
        type="button"
        className={styles.switcherButton}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="org-menu"
        onClick={() => {
          setOpen((o) => !o);
          requestAnimationFrame(() => menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus());
        }}
      >
        <BriefcaseIcon size={16} />
        <span>Switch Organization</span>
        <ChevronDownIcon size={16} className={open ? styles.chevronOpen : undefined} />
      </button>
      {open && (
        <ul
          id="org-menu"
          role="menu"
          ref={menuRef}
          className={styles.orgMenu}
          aria-label="Organizations"
          onKeyDown={onMenuKeyDown}
        >
          {organizations.length === 0 ? (
            <li role="none" className={styles.orgEmpty}>
              {state.status === 'loading' ? 'Loading organizations…' : 'No organizations available'}
            </li>
          ) : (
            organizations.map((org) => (
              <li role="none" key={org}>
                <button type="button" role="menuitem" className={styles.orgItem} onClick={() => choose(org)}>
                  {org}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
