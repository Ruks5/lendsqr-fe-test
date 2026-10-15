import type { ComponentType } from 'react';
import { CoinsIcon, DocumentIcon, UserGroupIcon, UsersIcon, type IconProps } from '@/components/icons';
import { Skeleton } from '@/components/ui';
import { formatNumber } from '@/lib/format';
import type { UserStats } from '@/lib/users';
import styles from './StatCards.module.scss';

interface CardDef {
  key: keyof UserStats;
  label: string;
  icon: ComponentType<IconProps>;
  tone: 'pink' | 'purple' | 'orange' | 'red';
}

const CARDS: CardDef[] = [
  { key: 'total', label: 'Users', icon: UsersIcon, tone: 'pink' },
  { key: 'active', label: 'Active Users', icon: UserGroupIcon, tone: 'purple' },
  { key: 'withLoans', label: 'Users with Loans', icon: DocumentIcon, tone: 'orange' },
  { key: 'withSavings', label: 'Users with Savings', icon: CoinsIcon, tone: 'red' },
];

interface StatCardsProps {
  /** null while loading. */
  stats: UserStats | null;
  /** True when the data failed to load: show a dash rather than a fake zero. */
  unavailable?: boolean;
}

export function StatCards({ stats, unavailable = false }: StatCardsProps) {
  const loading = stats === null && !unavailable;
  return (
    <ul className={styles.grid} aria-label="User summary" aria-busy={loading}>
      {CARDS.map(({ key, label, icon: Icon, tone }) => (
        <li key={key} className={styles.card}>
          <span className={`${styles.icon} ${styles[tone]}`} aria-hidden="true">
            <Icon size={20} />
          </span>
          <p className={styles.label}>{label}</p>
          <p className={styles.value}>
            {stats ? formatNumber(stats[key]) : loading ? <Skeleton width={80} height={28} /> : '—'}
          </p>
        </li>
      ))}
    </ul>
  );
}
