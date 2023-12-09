import { Metadata } from 'next';
import { generatePageTitle } from '@/lib/utils';
import { DonorsHeader } from './header';
import DonorsTable from './table';
import { DonorCreateDialog } from './dialogs/create';
import { DonorUpdateDialog } from './dialogs/update';
import { DonorDeleteDialog } from './dialogs/delete';
import { DonorsProvider } from '@/context/DonorsContext';

export const metadata: Metadata = {
  title: generatePageTitle('Donors'),
};

export default async function DonorsPage() {
  return (
    <DonorsProvider>
      <DonorsHeader />
      <DonorsTable />
      <DonorCreateDialog />
      <DonorUpdateDialog />
      <DonorDeleteDialog />
    </DonorsProvider>
  );
}
