import { Metadata } from 'next';
import { generatePageTitle } from '@/lib/utils';
import { DonationsProvider } from '@/context/DonationsContext';
import { CreateDonationHeader } from './header';
import CreateDonationBody from './body';
import { Container } from '@mui/material';

export const metadata: Metadata = {
  title: generatePageTitle('New Donation'),
};

export default async function CreateDonationPage() {
  return (
    <DonationsProvider>
      <Container component='main' maxWidth='sm'>
        <CreateDonationHeader />
        <CreateDonationBody />
      </Container>
    </DonationsProvider>
  );
}
