import { useEffect, useMemo, type ReactNode } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@/components/icons';
import { Button, Skeleton, StateMessage, StatusBadge } from '@/components/ui';
import { useUserById, useUsers } from '@/features/users/useUsers';
import { useStatusChange } from '@/features/users/useStatusChange';
import { ProfileSummary } from '@/features/user-details/ProfileSummary';
import { DetailTabs } from '@/features/user-details/DetailTabs';
import { isDetailTab, type DetailTabId } from '@/features/user-details/tabs';
import { TabPanel } from '@/features/user-details/tabPanels';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { loadUserDetails, saveUserDetails } from '@/lib/storage';
import styles from './UserDetailsPage.module.scss';

/**
 * Renders from localStorage first (instant, and works if the API is down),
 * then switches to the live record once the list has loaded and writes it
 * back so the stored copy stays fresh.
 */
export default function UserDetailsPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { state, reload } = useUsers();
  const liveUser = useUserById(id);
  const storedUser = useMemo(() => loadUserDetails(id), [id]);
  const user = liveUser ?? storedUser;
  const { request: requestStatusChange, dialog } = useStatusChange();

  const [params, setParams] = useSearchParams();
  const tabParam = params.get('tab');
  const tab: DetailTabId = isDetailTab(tabParam) ? tabParam : 'general';
  const setTab = (next: DetailTabId) => {
    const p = new URLSearchParams(params);
    if (next === 'general') p.delete('tab');
    else p.set('tab', next);
    setParams(p, { replace: true });
  };

  useDocumentTitle(user ? `${user.username} · User details` : 'User details');

  useEffect(() => {
    if (liveUser) saveUserDetails(liveUser);
  }, [liveUser]);

  const backLink = (
    <Link to="/users" className={styles.back}>
      <ArrowLeftIcon size={26} strokeWidth={1.25} />
      Back to Users
    </Link>
  );

  if (!user) {
    if (state.status === 'loading') return <DetailsSkeleton back={backLink} />;
    return (
      <>
        {backLink}
        <div className={styles.card}>
          {state.status === 'error' ? (
            <StateMessage
              variant="error"
              title="We couldn’t load this user"
              description={state.error}
              actionLabel="Try again"
              onAction={reload}
            />
          ) : (
            <StateMessage
              variant="empty"
              title="User not found"
              description={`There’s no user with ID “${id}”. They may have been removed, or the link is incorrect.`}
            />
          )}
        </div>
      </>
    );
  }

  const isBlacklisted = user.status === 'Blacklisted';
  const isActive = user.status === 'Active';

  return (
    <>
      {backLink}

      <div className={styles.headingRow}>
        <div className={styles.heading}>
          <h1 className={styles.title}>User Details</h1>
          <StatusBadge status={user.status} />
        </div>
        <div className={styles.actions}>
          <Button
            variant="danger-outline"
            disabled={isBlacklisted}
            onClick={() => requestStatusChange(user, 'Blacklisted')}
          >
            Blacklist User
          </Button>
          <Button variant="secondary-outline" disabled={isActive} onClick={() => requestStatusChange(user, 'Active')}>
            Activate User
          </Button>
        </div>
      </div>

      {!liveUser && state.status === 'error' && (
        <p className={styles.offlineNote} role="status">
          Showing the saved copy of this user because the latest data couldn’t be loaded.{' '}
          <button type="button" onClick={reload}>
            Retry
          </button>
        </p>
      )}

      <section className={`${styles.card} ${styles.summaryCard}`} aria-label="User summary">
        <ProfileSummary user={user} />
        <DetailTabs active={tab} onChange={setTab} />
      </section>

      <section
        className={`${styles.card} ${styles.panel}`}
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        tabIndex={0}
      >
        <TabPanel tab={tab} user={user} />
      </section>

      {dialog}
    </>
  );
}

function DetailsSkeleton({ back }: { back: ReactNode }) {
  return (
    <div aria-busy="true" role="status">
      <span className="visually-hidden">Loading user details…</span>
      {back}
      <Skeleton width={180} height={28} className={styles.skeletonTitle} />
      <div className={`${styles.card} ${styles.summaryCard}`}>
        <div className={styles.skeletonSummary}>
          <Skeleton width={100} height={100} radius="50%" />
          <div>
            <Skeleton width={160} height={22} />
            <Skeleton width={100} height={14} className={styles.skeletonGap} />
          </div>
        </div>
      </div>
      <div className={`${styles.card} ${styles.panel}`}>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className={styles.skeletonGrid}>
            {Array.from({ length: 5 }, (_, j) => (
              <div key={j}>
                <Skeleton width="60%" height={10} />
                <Skeleton width="80%" height={16} className={styles.skeletonGap} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
