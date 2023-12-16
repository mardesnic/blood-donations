import { Metadata } from 'next';
import DonorService from '@/app/api/donors/service';
import { generatePageTitle, getDisplayName } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { DonorDetailsHeader } from './header';
import { DonorDetailsForm } from '../forms/details';
import { DonationsProvider } from '@/context/DonationsContext';
import DonationsTable from '../../donations/table';
import { DonationCreateDialog } from '../../donations/dialogs/create';
import { DonationUpdateDialog } from '../../donations/dialogs/update';
import { DonationDeleteDialog } from '../../donations/dialogs/delete';
import { DonationsHeader } from '../../donations/header';
import { Divider } from '@mui/material';

type Props = {
  params: { id: string };
};

export async function generateMetadata({
  params: { id },
}: Props): Promise<Metadata> {
  const donor = await DonorService.findOne(id);
  return {
    title: generatePageTitle(
      getDisplayName([donor?.firstName || '', donor?.lastName || ''])
    ),
  };
}

export default async function DonorsDetailsPage({ params: { id } }: Props) {
  const donor = await DonorService.findOne(id);
  if (!donor) {
    notFound();
  }
  return (
    <>
      <DonorDetailsHeader donor={donor} />
      <DonorDetailsForm donor={donor} />
      <Divider sx={{ my: 4 }} />
      <DonationsProvider donor={donor}>
        <DonationsHeader />
        <DonationsTable />
        <DonationCreateDialog />
        <DonationUpdateDialog />
        <DonationDeleteDialog />
      </DonationsProvider>
    </>
  );
}
