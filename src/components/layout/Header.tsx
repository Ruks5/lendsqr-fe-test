import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BellIcon, CaretDownIcon, LogoutIcon, MenuIcon, SearchIcon, CloseIcon } from '@/components/icons';
import { useAuth } from '@/features/auth/useAuth';
import { useDismiss } from '@/hooks/useDismiss';
import { useMenuKeyboard } from '@/hooks/useMenuKeyboard';
import avatar from '@/assets/images/avatar.jpg';
import { Logo } from './Logo';
import styles from './Header.module.scss';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.menuToggle}
        onClick={onToggleSidebar}
        aria-expanded={sidebarOpen}
        aria-controls="app-sidebar"
        aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
      >
        {sidebarOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
      </button>

      <Link to="/dashboard" className={styles.logo} aria-label="Lendsqr dashboard">
        <Logo height={30} />
      </Link>

      <SearchForm className={styles.search} />

      <div className={styles.actions}>
        <a className={styles.docs} href="https://lendsqr.com" target="_blank" rel="noreferrer">
          Docs
        </a>
        <button type="button" className={styles.iconButton} aria-label="Notifications">
          <BellIcon size={24} />
        </button>
        <ProfileMenu />
      </div>
    </header>
  );
}

/** Header search: submits to the Users page as ?q=… so results are linkable. */
export function SearchForm({ className, id = 'global-search' }: { className?: string; id?: string }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const urlQuery = params.get('q') ?? '';
  const [query, setQuery] = useState(urlQuery);

  // Keep the box in sync when the query changes elsewhere (e.g. "Clear filters").
  useEffect(() => setQuery(urlQuery), [urlQuery]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/users?q=${encodeURIComponent(q)}` : '/users');
  };

  return (
    <form role="search" className={[styles.searchForm, className].filter(Boolean).join(' ')} onSubmit={onSubmit}>
      <label htmlFor={id} className="visually-hidden">
        Search users
      </label>
      <input
        id={id}
        type="search"
        placeholder="Search for anything"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />
      <button type="submit" aria-label="Search">
        <SearchIcon size={14} strokeWidth={2.5} />
      </button>
    </form>
  );
}

function ProfileMenu() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const onMenuKeyDown = useMenuKeyboard(menuRef);

  const close = useCallback(() => setOpen(false), []);
  useDismiss([wrapperRef], close, open);

  const toggle = () => {
    setOpen((o) => !o);
    requestAnimationFrame(() => menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus());
  };

  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.profile} ref={wrapperRef}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.profileButton}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="profile-menu"
        onClick={toggle}
      >
        <img src={avatar} alt="" className={styles.avatar} width={48} height={48} />
        <span className={styles.name}>{session?.name ?? 'User'}</span>
        <CaretDownIcon size={20} />
      </button>
      {open && (
        <ul
          id="profile-menu"
          role="menu"
          ref={menuRef}
          className={styles.menu}
          aria-label="Account"
          onKeyDown={onMenuKeyDown}
        >
          <li role="none" className={styles.menuEmail}>
            {session?.email}
          </li>
          <li role="none">
            <button type="button" role="menuitem" className={styles.menuItem} onClick={onLogout}>
              <LogoutIcon size={16} /> Log out
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
