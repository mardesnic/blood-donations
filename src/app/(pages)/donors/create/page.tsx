import { Metadata } from 'next';
import { Container } from '@mui/material';
import { Card } from '@mui/material';

import { generatePageTitle } from '@/lib/utils';
import { DonorsProvider } from '@/context/DonorsContext';
import { CreateDonorHeader } from './header';
import { DonorCreateUpdateForm } from '@/app/(pages)/donors/forms/createUpdate';

export const metadata: Metadata = {
  title: generatePageTitle('New Donor'),
};

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
