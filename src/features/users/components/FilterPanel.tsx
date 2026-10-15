import { forwardRef, useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, SelectField, TextField } from '@/components/ui';
import { USER_STATUSES, EMPTY_FILTERS, type UserFilters } from '@/types/user';
import styles from './FilterPanel.module.scss';

interface FilterPanelProps {
  /** Currently applied filters; the form starts from these. */
  value: UserFilters;
  organizations: readonly string[];
  onApply: (filters: UserFilters) => void;
  onReset: () => void;
  onClose: () => void;
}

/**
 * Popover form from the design. Edits are held as a draft and only applied
 * on "Filter", so the table doesn't re-filter on every keystroke.
 */
export const FilterPanel = forwardRef<HTMLDivElement, FilterPanelProps>(function FilterPanel(
  { value, organizations, onApply, onReset, onClose },
  ref,
) {
  const [draft, setDraft] = useState<UserFilters>(value);
  const firstFieldRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  const set = (key: keyof UserFilters) => (e: { target: { value: string } }) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    onApply({ ...draft, q: value.q });
    onClose();
  };

  const handleReset = () => {
    setDraft(EMPTY_FILTERS);
    onReset();
    onClose();
  };

  return (
    <div ref={ref} className={styles.panel} role="dialog" aria-modal="false" aria-label="Filter users">
      <form onSubmit={onSubmit} className={styles.form}>
        <SelectField
          ref={firstFieldRef}
          label="Organization"
          name="organization"
          options={organizations}
          value={draft.organization}
          onChange={set('organization')}
        />
        <TextField
          label="Username"
          name="username"
          placeholder="User"
          value={draft.username}
          onChange={set('username')}
          autoComplete="off"
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          placeholder="Email"
          value={draft.email}
          onChange={set('email')}
          autoComplete="off"
        />
        <TextField
          label="Date"
          name="date"
          type="date"
          placeholder="Date"
          value={draft.date}
          onChange={set('date')}
          max="9999-12-31"
        />
        <TextField
          label="Phone Number"
          name="phoneNumber"
          type="tel"
          inputMode="tel"
          placeholder="Phone Number"
          value={draft.phoneNumber}
          onChange={set('phoneNumber')}
          autoComplete="off"
        />
        <SelectField
          label="Status"
          name="status"
          options={USER_STATUSES}
          value={draft.status}
          onChange={set('status')}
        />

        <div className={styles.actions}>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button type="submit">Filter</Button>
        </div>
      </form>
    </div>
  );
});
