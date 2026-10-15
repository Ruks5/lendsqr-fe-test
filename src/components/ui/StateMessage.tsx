import type { ReactNode } from 'react';
import { AlertIcon, InboxIcon } from '@/components/icons';
import { Button } from './Button';
import styles from './StateMessage.module.scss';

interface StateMessageProps {
  variant: 'empty' | 'error';
  title: string;
  description?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  compact?: boolean;
}

/** Shared empty / error state block with an optional recovery action. */
export function StateMessage({ variant, title, description, actionLabel, onAction, icon, compact }: StateMessageProps) {
  return (
    <div
      className={[styles.state, styles[variant], compact && styles.compact].filter(Boolean).join(' ')}
      role={variant === 'error' ? 'alert' : undefined}
    >
      <div className={styles.icon} aria-hidden="true">
        {icon ?? (variant === 'error' ? <AlertIcon size={28} /> : <InboxIcon size={28} />)}
      </div>
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      {actionLabel && onAction && (
        <Button variant={variant === 'error' ? 'primary' : 'outline'} onClick={onAction} className={styles.action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
