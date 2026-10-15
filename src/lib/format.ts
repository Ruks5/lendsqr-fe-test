// Formatters are created once at module load; Intl constructors are
// relatively expensive and these run for every table cell.

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

const numberFormatter = new Intl.NumberFormat('en-US');

const nairaFormatter = new Intl.NumberFormat('en-NG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** "May 15, 2020 10:00 AM", matching the table in the design. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  // Intl puts a comma before the time ("May 15, 2020, 10:00 AM"); the design doesn't.
  return dateTimeFormatter.format(date).replace(/, (\d{1,2}:\d{2})/, ' $1');
}

/** 2453 -> "2,453" */
export function formatNumber(value: number): string {
  return Number.isFinite(value) ? numberFormatter.format(value) : '—';
}

/** 200000 -> "₦200,000.00" */
export function formatNaira(value: number): string {
  return Number.isFinite(value) ? `₦${nairaFormatter.format(value)}` : '—';
}

/** Local calendar day of an ISO timestamp as yyyy-mm-dd (matches <input type="date">). */
export function toDateInputValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Shows "—" for empty or "N/A" values so blanks never read as missing data. */
export function displayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const text = String(value).trim();
  return text === '' ? '—' : text;
}
