import { useCallback, type KeyboardEvent, type RefObject } from 'react';

/**
 * Arrow/Home/End roving focus for role="menu" lists, per the WAI-ARIA
 * menu button pattern. Disabled items are skipped.
 */
export function useMenuKeyboard(menuRef: RefObject<HTMLElement | null>) {
  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const items = Array.from(
        menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [],
      );
      if (items.length === 0) return;
      const index = items.indexOf(document.activeElement as HTMLElement);
      let next: number | null = null;

      switch (event.key) {
        case 'ArrowDown':
          next = index < 0 ? 0 : (index + 1) % items.length;
          break;
        case 'ArrowUp':
          next = index <= 0 ? items.length - 1 : index - 1;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = items.length - 1;
          break;
        default:
          return;
      }
      event.preventDefault();
      items[next]?.focus();
    },
    [menuRef],
  );
}
