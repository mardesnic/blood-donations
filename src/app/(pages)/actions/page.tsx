import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { pageTitle } from '@/i18n/metadata';
import { ActionsProvider } from '@/context/ActionsContext';
import { ActionsHeader } from './header';
import ActionsTable from './table';
import { ActionCreateDialog } from './dialogs/create';
import { ActionUpdateDialog } from './dialogs/update';
import { ActionDeleteDialog } from './dialogs/delete';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pageTitles');
  return { title: await pageTitle(t('actions')) };
}

export default async function ActionsPage() {
  return (
    <ActionsProvider>
      <ActionsHeader />
      <ActionsTable />
      <ActionCreateDialog />
      <ActionUpdateDialog />
      <ActionDeleteDialog />
    </ActionsProvider>
  );
}
