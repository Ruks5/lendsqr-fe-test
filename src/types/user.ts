// Record shape derived from the Users table and User details frames in Figma.

export const USER_STATUSES = ['Active', 'Inactive', 'Pending', 'Blacklisted'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export type UserTier = 1 | 2 | 3;

export interface Guarantor {
  fullName: string;
  phoneNumber: string;
  email: string;
  relationship: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  bvn: string;
  gender: 'Male' | 'Female';
  maritalStatus: string;
  children: string;
  typeOfResidence: string;
}

export interface EducationAndEmployment {
  level: string;
  employmentStatus: string;
  sector: string;
  duration: string;
  officeEmail: string;
  /** Monthly income range in Naira, inclusive. */
  monthlyIncome: { min: number; max: number };
  loanRepayment: number;
}

export interface Socials {
  twitter: string;
  facebook: string;
  instagram: string;
}

export interface BankAccount {
  accountNumber: string;
  bankName: string;
}

export interface User {
  id: string;
  /** Public reference shown under the user's name, e.g. LSQFf587g90. */
  userCode: string;
  organization: string;
  username: string;
  email: string;
  phoneNumber: string;
  /** ISO 8601 timestamp. */
  dateJoined: string;
  status: UserStatus;
  tier: UserTier;
  accountBalance: number;
  bank: BankAccount;
  hasLoan: boolean;
  hasSavings: boolean;
  profile: UserProfile;
  education: EducationAndEmployment;
  socials: Socials;
  guarantors: Guarantor[];
}

/** Filter fields from the table's filter popover, plus the header search. */
export interface UserFilters {
  organization: string;
  username: string;
  email: string;
  /** yyyy-mm-dd, matched against the calendar day the user joined. */
  date: string;
  phoneNumber: string;
  status: UserStatus | '';
  /** Free-text query from the header search bar. */
  q: string;
}

export const EMPTY_FILTERS: UserFilters = {
  organization: '',
  username: '',
  email: '',
  date: '',
  phoneNumber: '',
  status: '',
  q: '',
};
