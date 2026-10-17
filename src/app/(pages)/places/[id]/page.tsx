import { Metadata } from 'next';
import { Divider } from '@mui/material';
import { notFound } from 'next/navigation';
import PlaceService from '@/app/api/places/service';
import { pageTitle } from '@/i18n/metadata';
import { PlacesProvider } from '@/context/PlacesContext';
import { ActionsProvider } from '@/context/ActionsContext';
import { ActionsHeader } from '@/app/(pages)/actions/header';
import ActionsTable from '@/app/(pages)/actions/table';
import { ActionCreateDialog } from '@/app/(pages)/actions/dialogs/create';
import { ActionUpdateDialog } from '@/app/(pages)/actions/dialogs/update';
import { ActionDeleteDialog } from '@/app/(pages)/actions/dialogs/delete';
import { PlaceCreateUpdateDialog } from '../dialogs/createUpdate';
import { PlaceDeleteDialog } from '../dialogs/delete';
import { PlaceDetails } from './details';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const place = await PlaceService.findOne(id);
  return { title: await pageTitle(place?.title) };
}

export default async function PlaceDetailsPage({ params }: Props) {
  const { id } = await params;
  const place = await PlaceService.findOne(id);
  if (!place) {
    notFound();
  }
  return (
    <>
      <PlacesProvider>
        <PlaceDetails place={place} />
        <PlaceCreateUpdateDialog />
        <PlaceDeleteDialog />
      </PlacesProvider>
      <Divider sx={{ my: 4 }} />
      {/* New actions created here get this place. */}
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
