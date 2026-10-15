import { useCallback, useState } from 'react';
import { ConfirmDialog } from '@/components/ui';
import { useToast } from '@/features/toast/toastContext';
import { saveUserDetails } from '@/lib/storage';
import { useUsers } from './useUsers';
import type { User, UserStatus } from '@/types/user';

type StatusAction = Extract<UserStatus, 'Active' | 'Blacklisted'>;

const COPY: Record<StatusAction, { title: string; verb: string; done: string }> = {
  Blacklisted: { title: 'Blacklist user?', verb: 'Blacklist', done: 'blacklisted' },
  Active: { title: 'Activate user?', verb: 'Activate', done: 'activated' },
};

/**
 * Shared by the table row menu and the User details header: asks for
 * confirmation, applies the change, persists it and announces the result.
 */
export function useStatusChange() {
  const { setUserStatus } = useUsers();
  const { notify } = useToast();
  const [pending, setPending] = useState<{ user: User; status: StatusAction } | null>(null);

  const request = useCallback((user: User, status: StatusAction) => setPending({ user, status }), []);
  const cancel = useCallback(() => setPending(null), []);

  const confirm = useCallback(() => {
    if (!pending) return;
    const { user, status } = pending;
    setUserStatus(user.id, status);
    saveUserDetails({ ...user, status });
    notify(`${user.username} has been ${COPY[status].done}.`);
    setPending(null);
  }, [pending, setUserStatus, notify]);

  const dialog = (
    <ConfirmDialog
      open={pending !== null}
      title={pending ? COPY[pending.status].title : ''}
      description={
        pending && (
          <>
            <strong>{pending.user.username}</strong> ({pending.user.email}) will be marked as{' '}
            <strong>{pending.status === 'Active' ? 'Active' : 'Blacklisted'}</strong>.
            {pending.status === 'Blacklisted' && ' They won’t be able to take new loans until reactivated.'}
          </>
        )
      }
      confirmLabel={pending ? COPY[pending.status].verb : ''}
      tone={pending?.status === 'Blacklisted' ? 'danger' : 'primary'}
      onConfirm={confirm}
      onCancel={cancel}
    />
  );

  return { request, dialog };
}
