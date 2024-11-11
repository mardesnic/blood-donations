import { Metadata } from 'next';
import DonorService from '@/app/api/donors/service';
import { generatePageTitle, getDisplayName } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { DonorDetailsHeader } from '../header';

import { Container } from '@mui/material';
import { DonorsProvider } from '@/context/DonorsContext';
import { DonationsProvider } from '@/context/DonationsContext';
import DonationsTable from '@/app/(pages)/donations/table';

type Props = {
  params: { id: string };
};

export async function generateMetadata({
  params: { id },
}: Props): Promise<Metadata> {
  const donor = await DonorService.findOne(id);
  return {
    title: generatePageTitle(
      getDisplayName([donor?.firstName || '', donor?.lastName || ''])
    ),
  };
}

export default async function DonorsDonationsPage({ params: { id } }: Props) {
  const donor = await DonorService.findOne(id);
  if (!donor) {
    notFound();
  }
  return (
    <DonorsProvider>
      <DonationsProvider donor={donor}>
        <Container component='main'>
          <DonorDetailsHeader donor={donor} />
          <DonationsTable />
        </Container>
      </DonationsProvider>
    </DonorsProvider>
  );
}
