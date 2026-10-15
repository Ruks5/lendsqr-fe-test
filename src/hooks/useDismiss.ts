import { useEffect, type RefObject } from 'react';

/**
 * Calls `onDismiss` on Escape or on a pointer press outside every ref'd
 * element. Used by popovers, menus and the mobile sidebar.
 */
export type DismissReason = 'escape' | 'outside';

export function useDismiss(
  refs: RefObject<HTMLElement | null>[],
  onDismiss: (reason: DismissReason) => void,
  enabled = true,
  /** Clicks inside elements matching this selector don't count as "outside". */
  ignoreSelector?: string,
): void {
  useEffect(() => {
    if (!enabled) return;

    const onPointerDown = (event: PointerEvent | MouseEvent) => {
      const target = event.target as Node;
      if (ignoreSelector && target instanceof Element && target.closest(ignoreSelector)) return;
      if (refs.every((ref) => !ref.current?.contains(target))) onDismiss('outside');
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onDismiss('escape');
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
    // refs are stable objects; re-subscribing on every render isn't needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, onDismiss, ignoreSelector]);
}
