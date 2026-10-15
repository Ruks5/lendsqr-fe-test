#!/usr/bin/env node
/**
 * Generates the 500-record mock dataset served at /mock/users.json.
 *
 * The faker seed is fixed so the output is reproducible: re-running the
 * script produces the same file, which keeps diffs and tests stable.
 *
 *   npm run generate:users            -> public/mock/users.json (500 records)
 *   npm run generate:users -- 1000    -> custom record count
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Faker, en_NG, en, base } from '@faker-js/faker';

const COUNT = Number(process.argv[2] ?? 500);
const SEED = 20261015;
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/mock/users.json');

const faker = new Faker({ locale: [en_NG, en, base] });
faker.seed(SEED);

const ORGANIZATIONS = ['Lendsqr', 'Irorun', 'Lendstar', 'Kwikcash', 'Trustfund', 'Paylater'];
const BANKS = ['Providus Bank', 'GTBank', 'Access Bank', 'Zenith Bank', 'First Bank', 'UBA', 'Kuda MFB'];
const STATUSES = [
  { value: 'Active', weight: 45 },
  { value: 'Inactive', weight: 20 },
  { value: 'Pending', weight: 20 },
  { value: 'Blacklisted', weight: 15 },
];
const EDUCATION = ['B.Sc', 'B.A', 'HND', 'OND', 'M.Sc', 'MBA', 'Ph.D', 'SSCE'];
const EMPLOYMENT = ['Employed', 'Self-employed', 'Unemployed', 'Student', 'Retired'];
const SECTORS = [
  'FinTech',
  'Banking',
  'Education',
  'Healthcare',
  'Agriculture',
  'Retail',
  'Oil and Gas',
  'Telecoms',
  'Public Sector',
];
const MARITAL = ['Single', 'Married', 'Divorced', 'Widowed'];
const RESIDENCE = ["Parent's Apartment", 'Rented Apartment', 'Own House', 'Company Housing'];
const RELATIONSHIPS = ['Sister', 'Brother', 'Mother', 'Father', 'Friend', 'Colleague', 'Spouse', 'Cousin'];
const INCOME_BANDS = [
  [50_000, 100_000],
  [100_000, 200_000],
  [200_000, 400_000],
  [400_000, 800_000],
  [800_000, 1_500_000],
];

const phone = () => `0${faker.helpers.arrayElement(['70', '80', '81', '90', '91'])}${faker.string.numeric(8)}`;
const handle = (first, last) => `@${first}_${last}`.toLowerCase().replace(/[^a-z0-9_@]/g, '');

function makeGuarantor() {
  const first = faker.person.firstName();
  const last = faker.person.lastName();
  return {
    fullName: `${first} ${last}`,
    phoneNumber: phone(),
    email: faker.internet.email({ firstName: first, lastName: last, provider: 'gmail.com' }).toLowerCase(),
    relationship: faker.helpers.arrayElement(RELATIONSHIPS),
  };
}

function makeUser(index) {
  const sex = faker.helpers.arrayElement(['female', 'male']);
  const firstName = faker.person.firstName(sex);
  const lastName = faker.person.lastName();
  const organization = faker.helpers.arrayElement(ORGANIZATIONS);
  const orgDomain = `${organization.toLowerCase()}.com`;
  const employmentStatus = faker.helpers.weightedArrayElement([
    { value: 'Employed', weight: 60 },
    ...EMPLOYMENT.slice(1).map((value) => ({ value, weight: 10 })),
  ]);
  const [min, max] = faker.helpers.arrayElement(INCOME_BANDS);
  const hasJob = employmentStatus === 'Employed' || employmentStatus === 'Self-employed';
  const hasLoan = faker.datatype.boolean({ probability: 0.55 });

  return {
    id: String(index + 1),
    userCode: `LSQ${faker.string.alphanumeric({ length: 8, casing: 'mixed' })}`,
    organization,
    username: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName, provider: orgDomain }).toLowerCase(),
    phoneNumber: phone(),
    dateJoined: faker.date.between({ from: '2019-01-01T00:00:00Z', to: '2026-09-30T23:59:59Z' }).toISOString(),
    status: faker.helpers.weightedArrayElement(STATUSES),
    tier: faker.helpers.arrayElement([1, 2, 3]),
    accountBalance: faker.number.int({ min: 0, max: 5_000_000 }) + faker.helpers.arrayElement([0, 0.5, 0.25]),
    bank: {
      accountNumber: faker.string.numeric(10),
      bankName: faker.helpers.arrayElement(BANKS),
    },
    hasLoan,
    hasSavings: faker.datatype.boolean({ probability: 0.65 }),
    profile: {
      firstName,
      lastName,
      bvn: faker.string.numeric(11),
      gender: sex === 'female' ? 'Female' : 'Male',
      maritalStatus: faker.helpers.arrayElement(MARITAL),
      children: faker.helpers.arrayElement(['None', '1', '2', '3', '4+']),
      typeOfResidence: faker.helpers.arrayElement(RESIDENCE),
    },
    education: {
      level: faker.helpers.arrayElement(EDUCATION),
      employmentStatus,
      sector: hasJob ? faker.helpers.arrayElement(SECTORS) : 'N/A',
      duration: employmentStatus === 'Employed' ? `${faker.number.int({ min: 1, max: 15 })} years` : 'N/A',
      officeEmail: hasJob ? faker.internet.email({ firstName, lastName, provider: orgDomain }).toLowerCase() : 'N/A',
      monthlyIncome: { min, max },
      loanRepayment: hasLoan ? faker.number.int({ min: 5, max: 150 }) * 1000 : 0,
    },
    socials: {
      twitter: handle(firstName, lastName),
      facebook: `${firstName} ${lastName}`,
      instagram: handle(firstName, lastName),
    },
    // Most users have one or two guarantors; some have none, which exercises
    // the empty state on the details page.
    guarantors: Array.from(
      {
        length: faker.helpers.weightedArrayElement([
          { value: 0, weight: 10 },
          { value: 1, weight: 50 },
          { value: 2, weight: 40 },
        ]),
      },
      makeGuarantor,
    ),
  };
}

const users = Array.from({ length: COUNT }, (_, i) => makeUser(i));

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(users));
console.log(`Wrote ${users.length} users to ${OUT}`);
