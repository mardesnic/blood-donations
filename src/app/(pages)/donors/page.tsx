import { Metadata } from 'next';
import { generatePageTitle } from '@/lib/utils';
import DonorsTable from './table';

import { DonorsProvider } from '@/context/DonorsContext';

export const metadata: Metadata = {
  title: generatePageTitle('Donors'),
};

export default async function DonorsPage() {
  return (
    <DonorsProvider>
      <DonorsTable />
    </DonorsProvider>
  );
}
