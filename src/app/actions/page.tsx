import { Metadata } from 'next';
import { generatePageTitle } from '@/lib/utils';
import { PageWrapper } from '@/components/PageWrapper';
import ActionsTable from '@/app/actions/table';
import { ActionsProvider } from '@/context/ActionsContext';
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
        <ActionsHeader />
        <ActionsTable />
        <ActionCreateDialog />
        <ActionUpdateDialog />
        <ActionDeleteDialog />
      </ActionsProvider>
    </PageWrapper>
  );
}
