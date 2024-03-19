import { Metadata } from 'next';
import DonorService from '@/app/api/donors/service';
import { generatePageTitle, getDisplayName } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { DonorDetailsHeader } from './header';

import { Card, Container } from '@mui/material';
import { DonorsProvider } from '@/context/DonorsContext';
import { DonorCreateUpdateForm } from '@/app/(pages)/donors/forms/createUpdate';
import { DonorDeleteDialog } from '@/app/(pages)/donors/dialogs/delete';

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

export default async function DonorsDetailsPage({ params: { id } }: Props) {
  const donor = await DonorService.findOne(id);
  if (!donor) {
    notFound();
  }
  return (
    <DonorsProvider>
      <Container component='main' maxWidth='sm'>
        <DonorDetailsHeader donor={donor} />
        <Card sx={{ mt: '30px', p: '30px 24px' }} raised={true}>
          <DonorCreateUpdateForm donor={donor} />
        </Card>
      </Container>
      <DonorDeleteDialog />
    </DonorsProvider>
  );
}
