import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton, StateMessage, StatusBadge } from '@/components/ui';
import { StatCards } from '@/features/users/components/StatCards';
import { useAuth } from '@/features/auth/useAuth';
import { useUsers } from '@/features/users/useUsers';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDateTime, formatNumber } from '@/lib/format';
import { computeStats, countBy } from '@/lib/users';
import { saveUserDetails } from '@/lib/storage';
import { USER_STATUSES } from '@/types/user';
import styles from './DashboardPage.module.scss';

/**
 * The design has no Dashboard frame. This is a deliberately small overview
 * built from the same data and components as Users: the summary cards, two
 * breakdowns and the latest sign-ups, each linking into the Users table.
 */
export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { session } = useAuth();
  const { state, reload } = useUsers();
  const users = state.status === 'success' ? state.users : null;

  const derived = useMemo(() => {
    if (!users) return null;
    const byStatus = countBy(users, (u) => u.status);
    const byOrg = Object.entries(countBy(users, (u) => u.organization)).sort((a, b) => b[1] - a[1]);
    const recent = [...users].sort((a, b) => Date.parse(b.dateJoined) - Date.parse(a.dateJoined)).slice(0, 5);
    return { stats: computeStats(users), byStatus, byOrg, recent };
  }, [users]);

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.greeting}>
          Welcome back{session ? `, ${session.name}` : ''}. Here’s how your customer base looks today.
        </p>
      </div>

      <StatCards stats={derived?.stats ?? null} unavailable={state.status === 'error'} />

      {state.status === 'error' ? (
        <div className={styles.card}>
          <StateMessage
            variant="error"
            title="We couldn’t load your dashboard"
            description={state.error}
            actionLabel="Try again"
            onAction={reload}
          />
        </div>
      ) : (
        <div className={styles.grid}>
          <section className={styles.card} aria-labelledby="status-heading">
            <h2 id="status-heading" className={styles.cardTitle}>
              Users by status
            </h2>
            {derived ? (
              <BarList
                total={derived.stats.total}
                rows={USER_STATUSES.map((s) => ({
                  key: s,
                  label: <StatusBadge status={s} />,
                  value: derived.byStatus[s] ?? 0,
                  href: `/users?status=${s}`,
                  name: s,
                }))}
              />
            ) : (
              <ListSkeleton rows={4} />
            )}
          </section>

          <section className={styles.card} aria-labelledby="org-heading">
            <h2 id="org-heading" className={styles.cardTitle}>
              Users by organization
            </h2>
            {derived ? (
              <BarList
                total={derived.stats.total}
                rows={derived.byOrg.map(([org, count]) => ({
                  key: org,
                  label: org,
                  value: count,
                  href: `/users?organization=${encodeURIComponent(org)}`,
                  name: org,
                }))}
              />
            ) : (
              <ListSkeleton rows={6} />
            )}
          </section>

          <section className={`${styles.card} ${styles.wide}`} aria-labelledby="recent-heading">
            <div className={styles.cardHeader}>
              <h2 id="recent-heading" className={styles.cardTitle}>
                Recently joined
              </h2>
              <Link to="/users" className={styles.viewAll}>
                View all users
              </Link>
            </div>
            {derived ? (
              derived.recent.length === 0 ? (
                <StateMessage variant="empty" compact title="No users yet" />
              ) : (
                <ul className={styles.recent}>
                  {derived.recent.map((u) => (
                    <li key={u.id}>
                      <Link to={`/users/${u.id}`} onClick={() => saveUserDetails(u)} className={styles.recentLink}>
                        <span className={styles.recentName}>{u.username}</span>
                        <span className={styles.recentMeta}>
                          {u.organization} · <time dateTime={u.dateJoined}>{formatDateTime(u.dateJoined)}</time>
                        </span>
                      </Link>
                      <StatusBadge status={u.status} />
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <ListSkeleton rows={5} />
            )}
          </section>
        </div>
      )}
    </>
  );
}

interface BarRow {
  key: string;
  label: ReactNode;
  name: string;
  value: number;
  href: string;
}

/** Horizontal bars with the count and share written out, so colour is never the only cue. */
function BarList({ rows, total }: { rows: BarRow[]; total: number }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className={styles.bars}>
      {rows.map((r) => {
        const share = total ? Math.round((r.value / total) * 100) : 0;
        return (
          <li key={r.key}>
            <Link
              to={r.href}
              className={styles.barRow}
              aria-label={`${r.name}: ${formatNumber(r.value)} users (${share}%). View in Users`}
            >
              <span className={styles.barLabel}>{r.label}</span>
              <span className={styles.barTrack} aria-hidden="true">
                <span className={styles.barFill} style={{ width: `${(r.value / max) * 100}%` }} />
              </span>
              <span className={styles.barValue} aria-hidden="true">
                {formatNumber(r.value)} <span>({share}%)</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ListSkeleton({ rows }: { rows: number }) {
  return (
    <div className={styles.skeletonList} aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} height={18} />
      ))}
    </div>
  );
}
