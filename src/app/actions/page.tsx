import { Metadata } from 'next';
import { generatePageTitle } from '@/lib/utils';
import { PageWrapper } from '@/components/PageWrapper';
import ActionsTable from '@/app/actions/table';
import { ActionsProvider } from '@/context/ActionsContext';
import { PlacesProvider } from '@/context/PlacesContext';
import { ActionsHeader } from './header';
import { ActionCreateDialog } from '@/app/actions/dialogs/create';
import { ActionUpdateDialog } from '@/app/actions/dialogs/update';
import { ActionDeleteDialog } from '@/app/actions/dialogs/delete';

export const metadata: Metadata = {
  title: generatePageTitle('Actions'),
};

export default async function ActionsPage() {
  return (
    <PageWrapper>
      <ActionsProvider>
        <PlacesProvider>
          <ActionsHeader />
          <ActionsTable />
          <ActionCreateDialog />
          <ActionUpdateDialog />
          <ActionDeleteDialog />
        </PlacesProvider>
      </ActionsProvider>
    </PageWrapper>
  );
}
