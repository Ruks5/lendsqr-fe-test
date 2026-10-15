export const DETAIL_TABS = [
  { id: 'general', label: 'General Details' },
  { id: 'documents', label: 'Documents' },
  { id: 'bank', label: 'Bank Details' },
  { id: 'loans', label: 'Loans' },
  { id: 'savings', label: 'Savings' },
  { id: 'app', label: 'App and System' },
] as const;

export type DetailTabId = (typeof DETAIL_TABS)[number]['id'];

export const isDetailTab = (v: string | null): v is DetailTabId => DETAIL_TABS.some((t) => t.id === v);
