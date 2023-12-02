import { Metadata } from 'next';
import { generatePageTitle } from '@/lib/utils';
import { PageWrapper } from '@/components/PageWrapper';
import PlacesTable from './table';
import { PlacesProvider } from '@/context/PlacesContext';
import { PlaceDeleteDialog } from './dialogs/delete';
import { PlaceCreateDialog } from './dialogs/create';
import { PlacesHeader } from './header';
import { PlaceUpdateDialog } from './dialogs/update';

export const metadata: Metadata = {
  title: generatePageTitle('Places'),
};

export default async function PlacesPage() {
  return (
    <PageWrapper>
      <PlacesProvider>
        <PlacesHeader />
        <PlacesTable />
        <PlaceCreateDialog />
        <PlaceUpdateDialog />
        <PlaceDeleteDialog />
      </PlacesProvider>
    </PageWrapper>
  );
}
