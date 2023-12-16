import { Metadata } from 'next';
import ActionService from '@/app/api/actions/service';
import { generatePageTitle } from '@/lib/utils';
import { Divider } from '@mui/material';
import { notFound } from 'next/navigation';
import { DonationsProvider } from '@/context/DonationsContext';
import { DonationsHeader } from '@/app/(pages)/donations/header';
import DonationsTable from '@/app/(pages)/donations/table';
import { DonationCreateDialog } from '@/app/(pages)/donations/dialogs/create';
import { DonationUpdateDialog } from '@/app/(pages)/donations/dialogs/update';
import { DonationDeleteDialog } from '@/app/(pages)/donations/dialogs/delete';
import { ActionDetailsHeader } from '@/app/(pages)/actions/[id]/header';
import { ActionDetailsForm } from '@/app/(pages)/actions/forms/details';

type Props = {
  params: { id: string };
};

export async function generateMetadata({
  params: { id },
}: Props): Promise<Metadata> {
  const action = await ActionService.findOne(id);
  return {
    title: generatePageTitle(action?.title),
  };
}

export default async function ActionDetails({ params: { id } }: Props) {
  const action = await ActionService.findOne(id);
  if (!action) {
    notFound();
  }
  return (
    <>
      <ActionDetailsHeader action={action} />
      <ActionDetailsForm action={action} />
      <Divider sx={{ my: 4 }} />
      <DonationsProvider action={action}>
        <DonationsHeader />
        <DonationsTable />
        <DonationCreateDialog />
        <DonationUpdateDialog />
        <DonationDeleteDialog />
      </DonationsProvider>
    </>
  );
}
