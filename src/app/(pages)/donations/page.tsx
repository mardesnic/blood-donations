import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { pageTitle } from '@/i18n/metadata';
import { DonationsProvider } from '@/context/DonationsContext';
import { DonationsHeader } from './header';
import DonationsTable from './table';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pageTitles');
  return { title: await pageTitle(t('donations')) };
}

export default async function DonationsPage() {
  return (
    <DonationsProvider>
      <DonationsHeader />
      <DonationsTable />
    </DonationsProvider>
  );
}
