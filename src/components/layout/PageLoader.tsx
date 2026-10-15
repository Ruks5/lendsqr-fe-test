import styles from './PageLoader.module.scss';

/** Fallback while a lazily-loaded route chunk downloads. */
export function PageLoader({ label = 'Loading page' }: { label?: string }) {
  return (
    <div className={styles.loader} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span className="visually-hidden">{label}…</span>
    </div>
  );
}
