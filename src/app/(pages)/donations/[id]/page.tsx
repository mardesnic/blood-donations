import { Metadata } from 'next';
import DonationService from '@/app/api/donations/service';
import { generatePageTitle } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { UpdateDonationHeader } from './header';
import { Container } from '@mui/material';
import { DonationsProvider } from '@/context/DonationsContext';
import UpdateDonationBody from './body';
import { DonationDeleteDialog } from '../dialogs/delete';

type Props = {
  params: { id: string };
};

export async function generateMetadata({
  params: { id },
}: Props): Promise<Metadata> {
  const donation = await DonationService.findOne(id);
  return {
    title: generatePageTitle(`Donation - ${donation?.donor?.fullName}`),
  };
}

export default async function DonationDetails({ params: { id } }: Props) {
  const donation = await DonationService.findOne(id);
  if (!donation) {
    notFound();
  }

  return (
    <DonationsProvider>
      <Container component='main' maxWidth='sm'>
        <UpdateDonationHeader donation={donation} />
        <UpdateDonationBody donation={donation} />
      </Container>
      <DonationDeleteDialog />
    </DonationsProvider>
  );
}
