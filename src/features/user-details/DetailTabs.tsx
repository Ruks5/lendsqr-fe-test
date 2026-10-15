import { useRef, type KeyboardEvent } from 'react';
import { DETAIL_TABS, type DetailTabId } from './tabs';
import styles from './DetailTabs.module.scss';

interface DetailTabsProps {
  active: DetailTabId;
  onChange: (id: DetailTabId) => void;
}

/** WAI-ARIA tabs: arrow keys move between tabs, only the active one is in the tab order. */
export function DetailTabs({ active, onChange }: DetailTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = DETAIL_TABS.findIndex((t) => t.id === active);
    const keyMap: Record<string, number> = {
      ArrowRight: (index + 1) % DETAIL_TABS.length,
      ArrowLeft: (index - 1 + DETAIL_TABS.length) % DETAIL_TABS.length,
      Home: 0,
      End: DETAIL_TABS.length - 1,
    };
    if (!(event.key in keyMap)) return;
    event.preventDefault();
    const next = DETAIL_TABS[keyMap[event.key]];
    onChange(next.id);
    listRef.current?.querySelector<HTMLButtonElement>(`#tab-${next.id}`)?.focus();
  };

  return (
    <div ref={listRef} role="tablist" aria-label="User information" className={styles.tabs} onKeyDown={onKeyDown}>
      {DETAIL_TABS.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            className={styles.tab}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
