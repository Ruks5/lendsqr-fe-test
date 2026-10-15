import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { EyeIcon, MoreVerticalIcon, UserCheckIcon, UserXIcon } from '@/components/icons';
import { useDismiss, type DismissReason } from '@/hooks/useDismiss';
import { useMenuKeyboard } from '@/hooks/useMenuKeyboard';
import type { User } from '@/types/user';
import styles from './RowActionsMenu.module.scss';

export type RowAction = 'view' | 'blacklist' | 'activate';

interface RowActionsMenuProps {
  user: User;
  onAction: (user: User, action: RowAction) => void;
}

const MENU_WIDTH = 180;

/**
 * Kebab menu for a table row. Rendered in a portal with fixed positioning
 * so the table's horizontal-scroll container can't clip it.
 */
export function RowActionsMenu({ user, onAction }: RowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const onMenuKeyDown = useMenuKeyboard(menuRef);
  const menuId = `row-actions-${user.id}`;

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);
  const dismiss = useCallback((reason: DismissReason) => close(reason === 'escape'), [close]);
  useDismiss([buttonRef, menuRef], dismiss, open);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const place = () => {
      const rect = buttonRef.current!.getBoundingClientRect();
      const menuHeight = menuRef.current?.offsetHeight ?? 140;
      const fitsBelow = rect.bottom + menuHeight + 8 < window.innerHeight;
      setPosition({
        top: fitsBelow ? rect.bottom + 4 : rect.top - menuHeight - 4,
        left: Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8)),
      });
    };
    place();
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus({ preventScroll: true });
    // Keep the fixed menu attached to its row while the page or table scrolls.
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, close]);

  const choose = (action: RowAction) => {
    close(action !== 'view');
    onAction(user, action);
  };

  const isBlacklisted = user.status === 'Blacklisted';
  const isActive = user.status === 'Active';

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        aria-label={`Actions for ${user.username}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <MoreVerticalIcon size={20} />
      </button>
      {open &&
        createPortal(
          <ul
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={`Actions for ${user.username}`}
            className={styles.menu}
            style={{ top: position?.top ?? -9999, left: position?.left ?? -9999, width: MENU_WIDTH }}
            onKeyDown={(e) => {
              if (e.key === 'Tab') close();
              onMenuKeyDown(e);
            }}
          >
            <li role="none">
              <button type="button" role="menuitem" className={styles.item} onClick={() => choose('view')}>
                <EyeIcon /> View Details
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className={styles.item}
                aria-disabled={isBlacklisted}
                onClick={() => !isBlacklisted && choose('blacklist')}
              >
                <UserXIcon /> Blacklist User
              </button>
            </li>
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className={styles.item}
                aria-disabled={isActive}
                onClick={() => !isActive && choose('activate')}
              >
                <UserCheckIcon /> Activate User
              </button>
            </li>
          </ul>,
          document.body,
        )}
    </>
  );
}
