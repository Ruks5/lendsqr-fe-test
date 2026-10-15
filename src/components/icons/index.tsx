import type { ReactNode, SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

/**
 * Line icons drawn on a 24px grid using currentColor, so they inherit text
 * colour and scale with `size`. Decorative by default (aria-hidden); the
 * control that contains one is responsible for the accessible name.
 */
function createIcon(paths: ReactNode, displayName: string, filled = false) {
  const Icon = ({ size = 16, ...props }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {paths}
    </svg>
  );
  Icon.displayName = displayName;
  return Icon;
}

export const SearchIcon = createIcon(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </>,
  'SearchIcon',
);

export const BellIcon = createIcon(
  <>
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </>,
  'BellIcon',
);

export const ChevronDownIcon = createIcon(<path d="m6 9 6 6 6-6" />, 'ChevronDownIcon');
export const ChevronLeftIcon = createIcon(<path d="m15 18-6-6 6-6" />, 'ChevronLeftIcon');
export const ChevronRightIcon = createIcon(<path d="m9 18 6-6-6-6" />, 'ChevronRightIcon');
export const CaretDownIcon = createIcon(<path d="M7 10h10l-5 6z" />, 'CaretDownIcon', true);

export const BriefcaseIcon = createIcon(
  <>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
  </>,
  'BriefcaseIcon',
);

export const HomeIcon = createIcon(
  <>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </>,
  'HomeIcon',
);

export const UsersIcon = createIcon(
  <>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M17.5 14a4.5 4.5 0 0 1 4 4.5" />
  </>,
  'UsersIcon',
);

export const UserGroupIcon = createIcon(
  <>
    <circle cx="12" cy="8" r="3" />
    <path d="M6 20a6 6 0 0 1 12 0" />
    <circle cx="5" cy="9" r="2" />
    <circle cx="19" cy="9" r="2" />
    <path d="M1.5 17a3.5 3.5 0 0 1 3.5-3.5M22.5 17a3.5 3.5 0 0 0-3.5-3.5" />
  </>,
  'UserGroupIcon',
);

export const UserCheckIcon = createIcon(
  <>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="m16 11 2 2 4-4" />
  </>,
  'UserCheckIcon',
);

export const UserXIcon = createIcon(
  <>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="m17 8 4 4m0-4-4 4" />
  </>,
  'UserXIcon',
);

export const UserPlusIcon = createIcon(
  <>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M19 8v6M16 11h6" />
  </>,
  'UserPlusIcon',
);

export const UserMinusIcon = createIcon(
  <>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 11h6" />
  </>,
  'UserMinusIcon',
);

export const UserIcon = createIcon(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </>,
  'UserIcon',
);

export const UserCogIcon = createIcon(
  <>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 9.5-5.8" />
    <circle cx="18" cy="17" r="2.5" />
    <path d="M18 13v1.5M18 19.5V21M14 17h1.5M20.5 17H22" />
  </>,
  'UserCogIcon',
);

export const SackIcon = createIcon(
  <>
    <path d="M9 3h6l-1.5 3h-3z" />
    <path d="M10.5 6C6 8 4 12 4 15.5 4 19 7 21 12 21s8-2 8-5.5C20 12 18 8 13.5 6" />
    <path d="M10 12.5v4.5M14 12.5v4.5M10 12.5l4 4.5M8.5 14h7" />
  </>,
  'SackIcon',
);

export const HandshakeIcon = createIcon(
  <>
    <path d="m11 17 2 2a1 1 0 1 0 3-3" />
    <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.9-3.9a2 2 0 0 0-2.8 0l-.9.9a1.4 1.4 0 0 1-2-2l2.8-2.8a3.8 3.8 0 0 1 5.4 0L21 8" />
    <path d="M21 3 22 13h-2M3 3 2 13l6.5 6.5a1 1 0 1 0 3-3M3 4h8" />
  </>,
  'HandshakeIcon',
);

export const PiggyBankIcon = createIcon(
  <>
    <path d="M19 9.5c-.8-2.6-3.6-4.5-7-4.5-4.4 0-7 2.9-7 6.5 0 2 .9 3.5 2 4.5V19h3v-1.5h4V19h3v-3c1-.6 1.6-1.4 2-2.5h2v-4z" />
    <path d="M2 9.5a2 2 0 0 0 3 1.5M16 11h.01" />
  </>,
  'PiggyBankIcon',
);

export const HandCoinsIcon = createIcon(
  <>
    <path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17" />
    <path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
    <path d="m2 16 6 6" />
    <circle cx="16" cy="6" r="3" />
  </>,
  'HandCoinsIcon',
);

export const BankIcon = createIcon(
  <>
    <path d="M3 10 12 4l9 6" />
    <path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18" />
  </>,
  'BankIcon',
);

export const CoinsIcon = createIcon(
  <>
    <ellipse cx="9" cy="6" rx="6" ry="2.5" />
    <path d="M3 6v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V6" />
    <path d="M3 10v4c0 1.4 2.7 2.5 6 2.5M9 16.5V18c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4c0-1.4-2.7-2.5-6-2.5" />
  </>,
  'CoinsIcon',
);

export const ReceiptIcon = createIcon(
  <>
    <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z" />
    <path d="M9 8h6M9 12h6M9 16h3" />
  </>,
  'ReceiptIcon',
);

export const GalaxyIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="2" />
    <path d="M12 4a8 8 0 0 1 8 8M12 20a8 8 0 0 1-8-8M7 6a7 7 0 0 1 11 2M17 18a7 7 0 0 1-11-2" />
  </>,
  'GalaxyIcon',
);

export const ScrollIcon = createIcon(
  <>
    <path d="M8 21h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8" />
    <path d="M8 3a2 2 0 0 0-2 2v14a2 2 0 1 1-4 0v-2h4M11 8h6M11 12h6" />
  </>,
  'ScrollIcon',
);

export const ChartBarIcon = createIcon(
  <>
    <path d="M3 3v18h18" />
    <path d="M8 16v-4M12 16V8M16 16v-6M20 16V6" />
  </>,
  'ChartBarIcon',
);

export const SlidersIcon = createIcon(
  <>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </>,
  'SlidersIcon',
);

export const BadgePercentIcon = createIcon(
  <>
    <path d="M12 2.5 14.6 4.5 18 4.3 18.8 7.6 21.5 9.6 20.2 12.7 21.5 15.8 18.8 17.8 18 21.1 14.6 20.9 12 22.9 9.4 20.9 6 21.1 5.2 17.8 2.5 15.8 3.8 12.7 2.5 9.6 5.2 7.6 6 4.3 9.4 4.5z" />
    <path d="m9 15 6-6M9.5 9.5h.01M14.5 14.5h.01" />
  </>,
  'BadgePercentIcon',
);

export const ClipboardListIcon = createIcon(
  <>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H9zM9 10h6M9 14h6M9 18h3" />
  </>,
  'ClipboardListIcon',
);

export const TireIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v5M12 16v5M3 12h5M16 12h5" />
  </>,
  'TireIcon',
);

export const LogoutIcon = createIcon(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5M21 12H9" />
  </>,
  'LogoutIcon',
);

export const FilterIcon = createIcon(<path d="M4 7h16M7 12h10M10 17h4" />, 'FilterIcon');

export const MoreVerticalIcon = createIcon(
  <>
    <circle cx="12" cy="5" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="12" cy="19" r="1.6" />
  </>,
  'MoreVerticalIcon',
  true,
);

export const EyeIcon = createIcon(
  <>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12" />
    <circle cx="12" cy="12" r="3" />
  </>,
  'EyeIcon',
);

export const ArrowLeftIcon = createIcon(<path d="M27 12H2m6-6-6 6 6 6" />, 'ArrowLeftIcon');

export const StarIcon = createIcon(
  <path d="m12 2.8 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.3l-5.7 3 1.1-6.3-4.6-4.5 6.4-.9z" />,
  'StarIcon',
);

export const CalendarIcon = createIcon(
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
  </>,
  'CalendarIcon',
);

export const MenuIcon = createIcon(<path d="M4 6h16M4 12h16M4 18h16" />, 'MenuIcon');
export const CloseIcon = createIcon(<path d="M18 6 6 18M6 6l12 12" />, 'CloseIcon');

export const AlertIcon = createIcon(
  <>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0" />
    <path d="M12 9v4M12 17h.01" />
  </>,
  'AlertIcon',
);

export const InboxIcon = createIcon(
  <>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1" />
  </>,
  'InboxIcon',
);

export const DocumentIcon = createIcon(
  <>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6M8 13h8M8 17h5" />
  </>,
  'DocumentIcon',
);

export const CheckIcon = createIcon(<path d="M20 6 9 17l-5-5" />, 'CheckIcon');
