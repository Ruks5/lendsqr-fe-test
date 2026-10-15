import { StarIcon, UserIcon } from '@/components/icons';
import { formatNaira } from '@/lib/format';
import type { User } from '@/types/user';
import styles from './ProfileSummary.module.scss';

export function ProfileSummary({ user }: { user: User }) {
  return (
    <div className={styles.summary}>
      <div className={styles.identity}>
        <span className={styles.avatar} aria-hidden="true">
          <UserIcon size={36} strokeWidth={1.5} />
        </span>
        <div>
          <h2 className={styles.name}>
            {user.profile.firstName} {user.profile.lastName}
          </h2>
          <p className={styles.code}>{user.userCode}</p>
        </div>
      </div>

      <div className={styles.tier}>
        <p className={styles.tierLabel}>User’s Tier</p>
        <TierStars tier={user.tier} />
      </div>

      <div className={styles.balance}>
        <p className={styles.amount}>{formatNaira(user.accountBalance)}</p>
        <p className={styles.bank}>
          {user.bank.accountNumber}/{user.bank.bankName}
        </p>
      </div>
    </div>
  );
}

function TierStars({ tier }: { tier: number }) {
  return (
    <span className={styles.stars} role="img" aria-label={`Tier ${tier} of 3`}>
      {[1, 2, 3].map((n) => (
        <StarIcon key={n} size={16} fill={n <= tier ? 'currentColor' : 'none'} strokeWidth={1.25} />
      ))}
    </span>
  );
}
