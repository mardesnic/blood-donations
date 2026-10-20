import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import React, { Suspense } from 'react';
import { Container, Typography } from '@mui/material';
import { pageTitle } from '@/i18n/metadata';
import { CallList } from './callList';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pageTitles');
  return { title: await pageTitle(t('callList')) };
}

// Donors to invite to the next drive, with a log of who was contacted.
export default async function CallListPage() {
  const t = await getTranslations('callList');
  return (
    <Container component='main' maxWidth='md' disableGutters>
      <Typography variant='h1' sx={{ mb: 0.5 }}>
        {t('title')}
      </Typography>
      <Typography color='text.secondary' sx={{ mb: 2 }}>
        {t('intro')}
      </Typography>
      {/* The filters live in the URL, read with useSearchParams. */}
      <Suspense>
        <CallList />
      </Suspense>
    </Container>
  );
}
