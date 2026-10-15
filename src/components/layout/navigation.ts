import type { ComponentType } from 'react';
import {
  BadgePercentIcon,
  BankIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ClipboardListIcon,
  CoinsIcon,
  GalaxyIcon,
  HandCoinsIcon,
  HandshakeIcon,
  HomeIcon,
  PiggyBankIcon,
  ReceiptIcon,
  SackIcon,
  ScrollIcon,
  SlidersIcon,
  TireIcon,
  UserCheckIcon,
  UserCogIcon,
  UserGroupIcon,
  UsersIcon,
  UserXIcon,
  type IconProps,
} from '@/components/icons';

export interface NavItem {
  label: string;
  path: string;
  icon: ComponentType<IconProps>;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

const item = (label: string, path: string, icon: ComponentType<IconProps>): NavItem => ({ label, path, icon });

export const NAV_SECTIONS: NavSection[] = [
  { items: [item('Dashboard', '/dashboard', HomeIcon)] },
  {
    title: 'Customers',
    items: [
      item('Users', '/users', UserGroupIcon),
      item('Guarantors', '/guarantors', UsersIcon),
      item('Loans', '/loans', SackIcon),
      item('Decision Models', '/decision-models', HandshakeIcon),
      item('Savings', '/savings', PiggyBankIcon),
      item('Loan Requests', '/loan-requests', HandCoinsIcon),
      item('Whitelist', '/whitelist', UserCheckIcon),
      item('Karma', '/karma', UserXIcon),
    ],
  },
  {
    title: 'Businesses',
    items: [
      item('Organization', '/organization', BriefcaseIcon),
      item('Loan Products', '/loan-products', HandCoinsIcon),
      item('Savings Products', '/savings-products', BankIcon),
      item('Fees and Charges', '/fees-and-charges', CoinsIcon),
      item('Transactions', '/transactions', ReceiptIcon),
      item('Services', '/services', GalaxyIcon),
      item('Service Account', '/service-account', UserCogIcon),
      item('Settlements', '/settlements', ScrollIcon),
      item('Reports', '/reports', ChartBarIcon),
    ],
  },
  {
    title: 'Settings',
    items: [
      item('Preferences', '/preferences', SlidersIcon),
      item('Fees and Pricing', '/fees-and-pricing', BadgePercentIcon),
      item('Audit Logs', '/audit-logs', ClipboardListIcon),
      item('Systems Messages', '/system-messages', TireIcon),
    ],
  },
];

/** Routes that exist in the sidebar but are outside this assessment's scope. */
export const PLACEHOLDER_ROUTES = NAV_SECTIONS.flatMap((s) => s.items).filter(
  (i) => i.path !== '/dashboard' && i.path !== '/users',
);
