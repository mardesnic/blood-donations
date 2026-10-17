import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { pageTitle } from '@/i18n/metadata';
import { PlacesProvider } from '@/context/PlacesContext';
import { PlacesHeader } from './header';
import PlacesTable from './table';
import { PlaceCreateUpdateDialog } from './dialogs/createUpdate';
import { PlaceDeleteDialog } from './dialogs/delete';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pageTitles');
  return { title: await pageTitle(t('places')) };
}

export default async function PlacesPage() {
  return (
    <PlacesProvider>
      <PlacesHeader />
      <PlacesTable />
      <PlaceCreateUpdateDialog />
      <PlaceDeleteDialog />
    </PlacesProvider>
  );
}
