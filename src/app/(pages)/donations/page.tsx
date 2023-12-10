import { Metadata } from 'next';
import { generatePageTitle } from '@/lib/utils';
import { DonationsProvider } from '@/context/DonationsContext';
import { DonationsHeader } from './header';
import DonationsTable from './table';
import { DonationCreateDialog } from './dialogs/create';
import { DonationUpdateDialog } from './dialogs/update';
import { DonationDeleteDialog } from './dialogs/delete';

export const metadata: Metadata = {
  title: generatePageTitle('Donations'),
};

export default async function DonationsPage() {
  return (
    <DonationsProvider>
      <DonationsHeader />
      <DonationsTable />
      <DonationCreateDialog />
      <DonationUpdateDialog />
      <DonationDeleteDialog />
    </DonationsProvider>
  );
}
