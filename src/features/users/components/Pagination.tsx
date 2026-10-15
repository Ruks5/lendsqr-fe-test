import { useId } from 'react';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import { formatNumber } from '@/lib/format';
import { getPageRange, PAGE_SIZE_OPTIONS } from '@/lib/users';
import styles from './Pagination.module.scss';

interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const sizeId = useId();
  const items = getPageRange(page, totalPages);
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className={styles.pagination}>
      <div className={styles.summary}>
        <label htmlFor={sizeId}>Showing</label>
        <span className={styles.selectWrap}>
          <select
            id={sizeId}
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-describedby={`${sizeId}-total`}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <ChevronDownIcon size={14} />
        </span>
        <span id={`${sizeId}-total`}>out of {formatNumber(totalItems)}</span>
        <span className="visually-hidden" aria-live="polite">
          Showing users {from} to {to} of {totalItems}
        </span>
      </div>

      <nav aria-label="Pagination" className={styles.nav}>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeftIcon size={14} strokeWidth={2.5} />
        </button>
        <ul className={styles.pages}>
          {items.map((item) =>
            typeof item === 'number' ? (
              <li key={item}>
                <button
                  type="button"
                  className={styles.page}
                  onClick={() => onPageChange(item)}
                  aria-current={item === page ? 'page' : undefined}
                  aria-label={`Page ${item}`}
                >
                  {item}
                </button>
              </li>
            ) : (
              <li key={item} className={styles.ellipsis} aria-hidden="true">
                …
              </li>
            ),
          )}
        </ul>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRightIcon size={14} strokeWidth={2.5} />
        </button>
      </nav>
    </div>
  );
}
