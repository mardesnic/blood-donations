import { Metadata } from 'next';
import { generatePageTitle } from '@/lib/utils';
import { DonationsProvider } from '@/context/DonationsContext';
import { DonationsHeader } from './header';
import DonationsTable from './table';

export const metadata: Metadata = {
  title: generatePageTitle('Donations'),
};

export default async function DonationsPage() {
  return (
    <DonationsProvider>
      <DonationsHeader />
      <DonationsTable />
    </DonationsProvider>
  );
}
