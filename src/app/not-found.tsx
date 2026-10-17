import { PageWrapper } from '@/components/PageWrapper';
import { pageTitle } from '@/i18n/metadata';
import { Typography } from '@mui/material';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  return { title: await pageTitle('404') };
}

export default async function NotFoundPage() {
  const t = await getTranslations('common');
  return (
    <PageWrapper>
      <Typography variant='h1'>{t('notFound')}</Typography>
    </PageWrapper>
  );
}
