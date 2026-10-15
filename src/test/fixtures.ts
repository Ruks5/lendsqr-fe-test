import type { User } from '@/types/user';

let seq = 0;

/** Builds a valid User; override any field per test. */
export function makeUser(overrides: Partial<User> = {}): User {
  seq += 1;
  const id = overrides.id ?? String(seq);
  return {
    id,
    userCode: `LSQtest${id}`,
    organization: 'Lendsqr',
    username: `Grace Effiom ${id}`,
    email: `grace${id}@lendsqr.com`,
    phoneNumber: '07060780922',
    dateJoined: '2020-04-30T10:00:00.000Z',
    status: 'Active',
    tier: 1,
    accountBalance: 200000,
    bank: { accountNumber: '9912345678', bankName: 'Providus Bank' },
    hasLoan: true,
    hasSavings: false,
    profile: {
      firstName: 'Grace',
      lastName: 'Effiom',
      bvn: '07060780922',
      gender: 'Female',
      maritalStatus: 'Single',
      children: 'None',
      typeOfResidence: "Parent's Apartment",
    },
    education: {
      level: 'B.Sc',
      employmentStatus: 'Employed',
      sector: 'FinTech',
      duration: '2 years',
      officeEmail: 'grace@lendsqr.com',
      monthlyIncome: { min: 200000, max: 400000 },
      loanRepayment: 40000,
    },
    socials: { twitter: '@grace_effiom', facebook: 'Grace Effiom', instagram: '@grace_effiom' },
    guarantors: [
      { fullName: 'Debby Ogana', phoneNumber: '07060780922', email: 'debby@gmail.com', relationship: 'Sister' },
    ],
    ...overrides,
  };
}

export function makeUsers(count: number, overrides: (i: number) => Partial<User> = () => ({})): User[] {
  return Array.from({ length: count }, (_, i) => makeUser({ id: String(i + 1), ...overrides(i) }));
}

export function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}
