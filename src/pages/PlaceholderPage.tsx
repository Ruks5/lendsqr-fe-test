import { Link } from 'react-router-dom';
import { StateMessage } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import styles from './UsersPage.module.scss';

/** Sidebar destinations outside this assessment's scope get an honest placeholder, not a dead link. */
export default function PlaceholderPage({ title }: { title: string }) {
  useDocumentTitle(title);
  return (
    <>
      <h1 className={styles.title}>{title}</h1>
      <section className={styles.card}>
        <StateMessage
          variant="empty"
          title={`${title} is coming soon`}
          description={
            <>
              This section isn’t part of this build yet. In the meantime you can manage customers from{' '}
              <Link to="/users">Users</Link>.
            </>
          }
        />
      </section>
    </>
  );
}
