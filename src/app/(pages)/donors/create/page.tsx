import { Metadata } from 'next';
import { Container } from '@mui/material';
import { Card } from '@mui/material';

import { getTranslations } from 'next-intl/server';
import { pageTitle } from '@/i18n/metadata';
import { DonorsProvider } from '@/context/DonorsContext';
import { CreateDonorHeader } from './header';
import { DonorCreateUpdateForm } from '@/app/(pages)/donors/forms/createUpdate';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pageTitles');
  return { title: await pageTitle(t('newDonor')) };
}

export default async function CreateDonorPage() {
  return (
    <DonorsProvider>
      <Container component='main' maxWidth='sm'>
        <CreateDonorHeader />
        <Card sx={{ mt: '30px', p: '30px 24px' }} raised={true}>
          <DonorCreateUpdateForm />
        </Card>
      </Container>
    </DonorsProvider>
  );
}
