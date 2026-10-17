import { Metadata } from 'next';
import ActionService from '@/app/api/actions/service';
import { pageTitle } from '@/i18n/metadata';
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
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const action = await ActionService.findOne(id);
  return {
    title: await pageTitle(action?.title),
  };
}

export default async function ActionDetails({ params }: Props) {
  const { id } = await params;
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
