import { Metadata } from 'next';
import { generatePageTitle } from '@/lib/utils';
import { ActionsProvider } from '@/context/ActionsContext';
import { PlacesProvider } from '@/context/PlacesContext';
import { ActionsHeader } from './header';
import ActionsTable from './table';
import { ActionCreateDialog } from './dialogs/create';
import { ActionUpdateDialog } from './dialogs/update';
import { ActionDeleteDialog } from './dialogs/delete';

export const metadata: Metadata = {
  title: generatePageTitle('Actions'),
};

export default async function ActionsPage() {
  return (
    <ActionsProvider>
      <PlacesProvider>
        <ActionsHeader />
        <ActionsTable />
        <ActionCreateDialog />
        <ActionUpdateDialog />
        <ActionDeleteDialog />
      </PlacesProvider>
    </ActionsProvider>
  );
}
