import { Metadata } from 'next';
import PlaceService from '@/app/api/places/service';
import { generatePageTitle } from '@/lib/utils';
import { Divider } from '@mui/material';
import { notFound } from 'next/navigation';
import { PlaceDetailsHeader } from './header';
import { PlaceDetailsForm } from '../forms/details';
import { ActionsProvider } from '@/context/ActionsContext';
import { ActionsHeader } from '@/app/(pages)/actions/header';
import ActionsTable from '@/app/(pages)/actions/table';
import { ActionCreateDialog } from '@/app/(pages)/actions/dialogs/create';
import { ActionUpdateDialog } from '@/app/(pages)/actions/dialogs/update';
import { ActionDeleteDialog } from '@/app/(pages)/actions/dialogs/delete';

type Props = {
  params: { id: string };
};

export async function generateMetadata({
  params: { id },
}: Props): Promise<Metadata> {
  const place = await PlaceService.findOne(id);
  return {
    title: generatePageTitle(place?.title),
  };
}

export default async function PlaceDetails({ params: { id } }: Props) {
  const place = await PlaceService.findOne(id);
  if (!place) {
    notFound();
  }
  return (
    <>
      <PlaceDetailsHeader place={place} />
      <PlaceDetailsForm place={place} />
      <Divider sx={{ my: 4 }} />
      <ActionsProvider place={place}>
        <ActionsHeader />
        <ActionsTable />
        <ActionCreateDialog />
        <ActionUpdateDialog />
        <ActionDeleteDialog />
      </ActionsProvider>
    </>
  );
}
