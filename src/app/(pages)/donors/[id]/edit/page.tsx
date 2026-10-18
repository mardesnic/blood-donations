import { Metadata } from 'next';
import DonorService from '@/app/api/donors/service';
import { getDisplayName } from '@/lib/utils';
import { pageTitle } from '@/i18n/metadata';
import { notFound } from 'next/navigation';
import { ROUTE_PATHS } from '@/routes';
import { DonorDetailsHeader } from '../header';

import { Card, Container } from '@mui/material';
import { DonorsProvider } from '@/context/DonorsContext';
import { DonorCreateUpdateForm } from '@/app/(pages)/donors/forms/createUpdate';
import { DonorDeleteDialog } from '@/app/(pages)/donors/dialogs/delete';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const donor = await DonorService.findOne(id);
  return {
    title: await pageTitle(
      getDisplayName([donor?.firstName || '', donor?.lastName || ''])
    ),
  };
}

// Edits the donor; the arrow goes back to the donor's overview.
export default async function EditDonorPage({ params }: Props) {
  const { id } = await params;
  const donor = await DonorService.findOne(id);
  if (!donor) {
    notFound();
  }
  return (
    <DonorsProvider>
      <Container component='main' maxWidth='sm'>
        <DonorDetailsHeader
          donor={donor}
          backHref={`${ROUTE_PATHS.PROTECTED.DONORS.path}/${donor.id}`}
        />
        <Card sx={{ mt: '30px', p: '30px 24px' }} raised={true}>
          <DonorCreateUpdateForm donor={donor} />
        </Card>
      </Container>
      <DonorDeleteDialog />
    </DonorsProvider>
  );
}
