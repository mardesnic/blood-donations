import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { pageTitle } from '@/i18n/metadata';
import DonorsTable from './table';

import { DonorsProvider } from '@/context/DonorsContext';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pageTitles');
  return { title: await pageTitle(t('donors')) };
}

export default async function DonorsPage() {
  return (
    <DonorsProvider>
      <DonorsTable />
    </DonorsProvider>
  );
}
