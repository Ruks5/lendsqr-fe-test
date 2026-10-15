import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FilterIcon } from '@/components/icons';
import { StateMessage } from '@/components/ui';
import { useUsers } from '@/features/users/useUsers';
import { useStatusChange } from '@/features/users/useStatusChange';
import { StatCards } from '@/features/users/components/StatCards';
import { UsersTable } from '@/features/users/components/UsersTable';
import { FilterPanel } from '@/features/users/components/FilterPanel';
import { Pagination } from '@/features/users/components/Pagination';
import type { RowAction } from '@/features/users/components/RowActionsMenu';
import { useDismiss, type DismissReason } from '@/hooks/useDismiss';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { saveUserDetails } from '@/lib/storage';
import {
  computeStats,
  filterUsers,
  filtersFromParams,
  filtersToParams,
  getTotalPages,
  hasActiveFilters,
  paginate,
  parsePage,
  parsePageSize,
  uniqueSorted,
} from '@/lib/users';
import { EMPTY_FILTERS, type User, type UserFilters } from '@/types/user';
import styles from './UsersPage.module.scss';

/**
 * Users list. All list state (filters, page, page size) lives in the URL so
 * a filtered view survives refresh, the back button works, and links can
 * be shared.
 */
export default function UsersPage() {
  useDocumentTitle('Users');
  const { state, reload } = useUsers();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { request: requestStatusChange, dialog } = useStatusChange();

  const [filterOpen, setFilterOpen] = useState(false);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const users = state.status === 'success' ? state.users : null;
  const filters = useMemo(() => filtersFromParams(params), [params]);
  const pageSize = parsePageSize(params.get('size'));

  const stats = useMemo(() => (users ? computeStats(users) : null), [users]);
  const organizations = useMemo(() => (users ? uniqueSorted(users.map((u) => u.organization)) : []), [users]);
  const filtered = useMemo(() => (users ? filterUsers(users, filters) : []), [users, filters]);
  const totalPages = getTotalPages(filtered.length, pageSize);
  const page = parsePage(params.get('page'), totalPages);
  const pageRows = useMemo(() => paginate(filtered, page, pageSize), [filtered, page, pageSize]);
  const filtersActive = hasActiveFilters(filters);

  const updateParams = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      const next = new URLSearchParams(params);
      mutate(next);
      setParams(next);
    },
    [params, setParams],
  );

  const applyFilters = (next: UserFilters) => {
    const nextParams = filtersToParams(next, params);
    nextParams.delete('page');
    setParams(nextParams);
  };

  const clearFilters = () => applyFilters(EMPTY_FILTERS);

  const goToPage = (n: number) => {
    updateParams((p) => (n <= 1 ? p.delete('page') : p.set('page', String(n))));
    document.getElementById('users-table-card')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const changePageSize = (size: number) =>
    updateParams((p) => {
      p.set('size', String(size));
      p.delete('page');
    });

  const closeFilter = useCallback((reason?: DismissReason) => {
    setFilterOpen(false);
    // Return focus to the trigger, except when the user clicked elsewhere.
    if (reason !== 'outside') lastTriggerRef.current?.focus();
  }, []);
  useDismiss([panelRef], closeFilter, filterOpen, '[data-filter-trigger]');

  const toggleFilter = (trigger: HTMLButtonElement) => {
    lastTriggerRef.current = trigger;
    setFilterOpen((o) => !o);
  };

  const onAction = useCallback(
    (user: User, action: RowAction) => {
      if (action === 'view') {
        saveUserDetails(user);
        navigate(`/users/${user.id}`);
      } else {
        requestStatusChange(user, action === 'blacklist' ? 'Blacklisted' : 'Active');
      }
    },
    [navigate, requestStatusChange],
  );

  let fallback = null;
  if (state.status === 'error') {
    fallback = (
      <StateMessage
        variant="error"
        title="We couldn’t load users"
        description={state.error}
        actionLabel="Try again"
        onAction={reload}
      />
    );
  } else if (users && users.length === 0) {
    fallback = (
      <StateMessage variant="empty" title="No users yet" description="Users will appear here once customers sign up." />
    );
  } else if (users && filtered.length === 0) {
    fallback = (
      <StateMessage
        variant="empty"
        title="No users match your filters"
        description="Try a different search term or remove some filters."
        actionLabel="Clear filters"
        onAction={clearFilters}
      />
    );
  }

  const activeFilterCount = (Object.keys(EMPTY_FILTERS) as (keyof UserFilters)[]).filter((k) =>
    filters[k].trim(),
  ).length;

  return (
    <>
      <h1 className={styles.title}>Users</h1>

      <StatCards stats={stats} unavailable={state.status === 'error'} />

      {filtersActive && users && (
        <div className={styles.filterSummary} role="status">
          <span>
            {filtered.length === 1 ? '1 user matches' : `${filtered.length.toLocaleString()} users match`}
            {filters.q && (
              <>
                {' '}
                “<strong>{filters.q}</strong>”
              </>
            )}
            {activeFilterCount > (filters.q ? 1 : 0) &&
              ` with ${activeFilterCount - (filters.q ? 1 : 0)} filter(s) applied`}
          </span>
          <button type="button" className={styles.clear} onClick={clearFilters}>
            Clear all
          </button>
        </div>
      )}

      <section id="users-table-card" className={styles.card} aria-labelledby="users-table-heading">
        <h2 id="users-table-heading" className="visually-hidden">
          Users list
        </h2>
        <div className={styles.mobileToolbar}>
          <button
            data-filter-trigger
            type="button"
            className={styles.mobileFilterButton}
            aria-expanded={filterOpen}
            aria-haspopup="dialog"
            onClick={(e) => toggleFilter(e.currentTarget)}
          >
            <FilterIcon size={16} /> Filter
            {activeFilterCount > 0 && <span className={styles.badge}>{activeFilterCount}</span>}
          </button>
        </div>

        <UsersTable
          users={pageRows}
          loading={state.status === 'loading'}
          skeletonRows={Math.min(pageSize, 10)}
          filterOpen={filterOpen}
          onToggleFilter={toggleFilter}
          onAction={onAction}
          fallback={fallback}
          caption={`Users, page ${page} of ${totalPages}`}
        />

        {filterOpen && (
          <FilterPanel
            ref={panelRef}
            value={filters}
            organizations={organizations}
            onApply={applyFilters}
            onReset={clearFilters}
            onClose={() => closeFilter()}
          />
        )}
      </section>

      {users && filtered.length > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={filtered.length}
          totalPages={totalPages}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
        />
      )}

      {dialog}
    </>
  );
}
