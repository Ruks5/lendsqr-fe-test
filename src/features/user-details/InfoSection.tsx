import type { ReactNode } from 'react';
import { displayValue } from '@/lib/format';
import styles from './InfoSection.module.scss';

export interface InfoItem {
  label: string;
  value: string | number | null | undefined;
}

interface InfoSectionProps {
  title?: string;
  items?: InfoItem[];
  /** Column count on wide screens; the design uses 5 for personal info, 4 elsewhere. */
  columns?: 4 | 5;
  children?: ReactNode;
}

/** A titled group of label/value pairs, marked up as a description list. */
export function InfoSection({ title, items, columns = 5, children }: InfoSectionProps) {
  return (
    <section className={styles.section}>
      {title && <h3 className={styles.title}>{title}</h3>}
      {items && <InfoGrid items={items} columns={columns} />}
      {children}
    </section>
  );
}

export function InfoGrid({ items, columns = 5 }: { items: InfoItem[]; columns?: 4 | 5 }) {
  return (
    <dl className={`${styles.grid} ${styles[`cols${columns}`]}`}>
      {items.map(({ label, value }) => (
        <div key={label} className={styles.item}>
          <dt>{label}</dt>
          <dd>{displayValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}
