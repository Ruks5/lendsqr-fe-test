import { memo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FilterIcon } from '@/components/icons';
import { Skeleton, StatusBadge } from '@/components/ui';
import { formatDateTime } from '@/lib/format';
import { saveUserDetails } from '@/lib/storage';
import type { User } from '@/types/user';
import { RowActionsMenu, type RowAction } from './RowActionsMenu';
import styles from './UsersTable.module.scss';

const COLUMNS = [
  { key: 'organization', label: 'Organization' },
  { key: 'username', label: 'Username' },
  { key: 'email', label: 'Email' },
  { key: 'phoneNumber', label: 'Phone Number' },
  { key: 'dateJoined', label: 'Date Joined' },
  { key: 'status', label: 'Status' },
] as const;

interface UsersTableProps {
  users: readonly User[];
  loading: boolean;
  skeletonRows?: number;
  filterOpen: boolean;
  onToggleFilter: (trigger: HTMLButtonElement) => void;
  onAction: (user: User, action: RowAction) => void;
  /** Shown in place of rows (empty or error state). */
  fallback?: ReactNode;
  caption: string;
}

export function UsersTable({
  users,
  loading,
  skeletonRows = 10,
  filterOpen,
  onToggleFilter,
  onAction,
  fallback,
  caption,
}: UsersTableProps) {
  return (
    <div className={styles.scroller}>
      <table className={styles.table} aria-busy={loading}>
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {COLUMNS.map((col, i) => (
              <th key={col.key} scope="col">
                <span className={styles.th}>
                  {col.label}
                  <button
                    data-filter-trigger
                    type="button"
                    className={styles.filterButton}
                    aria-label={`Filter users${i === 0 ? '' : ` (${col.label})`}`}
                    aria-expanded={filterOpen}
                    aria-haspopup="dialog"
                    onClick={(e) => onToggleFilter(e.currentTarget)}
                  >
                    <FilterIcon size={16} strokeWidth={2} />
                  </button>
                </span>
              </th>
            ))}
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: skeletonRows }, (_, i) => <SkeletonRow key={i} />)
          ) : fallback ? (
            <tr className={styles.fallbackRow}>
              <td colSpan={COLUMNS.length + 1}>{fallback}</td>
            </tr>
          ) : (
            users.map((user) => <UserRow key={user.id} user={user} onAction={onAction} />)
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Memoised so a status change re-renders one row, not the whole page. */
const UserRow = memo(function UserRow({ user, onAction }: { user: User; onAction: UsersTableProps['onAction'] }) {
  return (
    <tr>
      <td data-label="Organization">{user.organization}</td>
      <td data-label="Username" className={styles.truncate} title={user.username}>
        <Link to={`/users/${user.id}`} className={styles.userLink} onClick={() => saveUserDetails(user)}>
          {user.username}
        </Link>
      </td>
      <td data-label="Email" className={styles.truncate} title={user.email}>
        {user.email}
      </td>
      <td data-label="Phone Number">{user.phoneNumber}</td>
      <td data-label="Date Joined">
        <time dateTime={user.dateJoined}>{formatDateTime(user.dateJoined)}</time>
      </td>
      <td data-label="Status">
        <StatusBadge status={user.status} />
      </td>
      <td className={styles.actionsCell}>
        <RowActionsMenu user={user} onAction={onAction} />
      </td>
    </tr>
  );
});

function SkeletonRow() {
  return (
    <tr className={styles.skeletonRow}>
      {[70, 100, 150, 100, 150, 80].map((w, i) => (
        <td key={i}>
          <Skeleton width={w} />
        </td>
      ))}
      <td />
    </tr>
  );
}
