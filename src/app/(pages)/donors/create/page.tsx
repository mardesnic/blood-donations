import { Metadata } from 'next';
import { generatePageTitle } from '@/lib/utils';
import { CreateDonorHeader } from './header';
import { Container } from '@mui/material';
import { DonorsProvider } from '@/context/DonorsContext';

export const metadata: Metadata = {
  title: generatePageTitle('New Donor'),
};

export default async function CreateDonorPage() {
  return (
    <DonorsProvider>
      <Container component='main' maxWidth='sm'>
        <CreateDonorHeader />
        {/*<CreateDonationBody />*/}
      </Container>
    </DonorsProvider>
  );
}
