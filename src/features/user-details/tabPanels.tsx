import { StateMessage } from '@/components/ui';
import { DocumentIcon } from '@/components/icons';
import { formatNaira, formatNumber } from '@/lib/format';
import type { User } from '@/types/user';
import { InfoGrid, InfoSection } from './InfoSection';
import type { DetailTabId } from './tabs';

export function GeneralDetails({ user }: { user: User }) {
  const { profile, education, socials, guarantors } = user;
  return (
    <>
      <InfoSection
        title="Personal Information"
        items={[
          { label: 'Full Name', value: `${profile.firstName} ${profile.lastName}` },
          { label: 'Phone Number', value: user.phoneNumber },
          { label: 'Email Address', value: user.email },
          { label: 'BVN', value: profile.bvn },
          { label: 'Gender', value: profile.gender },
          { label: 'Marital Status', value: profile.maritalStatus },
          { label: 'Children', value: profile.children },
          { label: 'Type of Residence', value: profile.typeOfResidence },
        ]}
      />
      <InfoSection
        title="Education and Employment"
        columns={4}
        items={[
          { label: 'Level of Education', value: education.level },
          { label: 'Employment Status', value: education.employmentStatus },
          { label: 'Sector of Employment', value: education.sector },
          { label: 'Duration of Employment', value: education.duration },
          { label: 'Office Email', value: education.officeEmail },
          {
            label: 'Monthly Income',
            value: `${formatNaira(education.monthlyIncome.min)} - ${formatNaira(education.monthlyIncome.max)}`,
          },
          { label: 'Loan Repayment', value: formatNumber(education.loanRepayment) },
        ]}
      />
      <InfoSection
        title="Socials"
        items={[
          { label: 'Twitter', value: socials.twitter },
          { label: 'Facebook', value: socials.facebook },
          { label: 'Instagram', value: socials.instagram },
        ]}
      />
      <InfoSection title={guarantors.length > 1 ? 'Guarantors' : 'Guarantor'}>
        {guarantors.length === 0 ? (
          <p>No guarantor on record for this user.</p>
        ) : (
          guarantors.map((g, i) => (
            <InfoGrid
              key={`${g.email}-${i}`}
              columns={4}
              items={[
                { label: 'Full Name', value: g.fullName },
                { label: 'Phone Number', value: g.phoneNumber },
                { label: 'Email Address', value: g.email },
                { label: 'Relationship', value: g.relationship },
              ]}
            />
          ))
        )}
      </InfoSection>
    </>
  );
}

function BankDetails({ user }: { user: User }) {
  return (
    <InfoSection
      title="Bank Details"
      columns={4}
      items={[
        { label: 'Bank Name', value: user.bank.bankName },
        { label: 'Account Number', value: user.bank.accountNumber },
        { label: 'Account Name', value: `${user.profile.firstName} ${user.profile.lastName}` },
        { label: 'Account Balance', value: formatNaira(user.accountBalance) },
      ]}
    />
  );
}

function LoansSummary({ user }: { user: User }) {
  if (!user.hasLoan) {
    return (
      <StateMessage
        variant="empty"
        compact
        title="No loans"
        description={`${user.profile.firstName} has no loans on record.`}
      />
    );
  }
  return (
    <InfoSection
      title="Loans"
      columns={4}
      items={[
        { label: 'Loan Status', value: 'Running' },
        { label: 'Monthly Repayment', value: formatNaira(user.education.loanRepayment) },
        { label: 'Tier', value: `Tier ${user.tier}` },
      ]}
    />
  );
}

function SavingsSummary({ user }: { user: User }) {
  if (!user.hasSavings) {
    return (
      <StateMessage
        variant="empty"
        compact
        title="No savings"
        description={`${user.profile.firstName} has no savings plans yet.`}
      />
    );
  }
  return (
    <InfoSection
      title="Savings"
      columns={4}
      items={[
        { label: 'Savings Status', value: 'Active' },
        { label: 'Wallet Balance', value: formatNaira(user.accountBalance) },
      ]}
    />
  );
}

export function TabPanel({ tab, user }: { tab: DetailTabId; user: User }) {
  switch (tab) {
    case 'general':
      return <GeneralDetails user={user} />;
    case 'bank':
      return <BankDetails user={user} />;
    case 'loans':
      return <LoansSummary user={user} />;
    case 'savings':
      return <SavingsSummary user={user} />;
    case 'documents':
      return (
        <StateMessage
          variant="empty"
          compact
          icon={<DocumentIcon size={28} />}
          title="No documents uploaded"
          description="Documents the user uploads during onboarding will appear here."
        />
      );
    case 'app':
      return (
        <StateMessage
          variant="empty"
          compact
          title="No app or system data"
          description="Device and session information isn’t available for this user yet."
        />
      );
  }
}
