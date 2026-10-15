import type { UserStatus } from '@/types/user';
import styles from './StatusBadge.module.scss';

export function StatusBadge({ status }: { status: UserStatus }) {
  return <span className={`${styles.badge} ${styles[status.toLowerCase()]}`}>{status}</span>;
}
