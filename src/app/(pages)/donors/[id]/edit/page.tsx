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
      {/* The page layout already has side margins. */}
      <Container component='main' maxWidth='sm' disableGutters>
        <DonorDetailsHeader
          donor={donor}
          backHref={`${ROUTE_PATHS.PROTECTED.DONORS.path}/${donor.id}`}
        />
        <Card
          // Less padding on phones, so the fields get the width.
          sx={{ mt: '30px', p: { xs: '24px 16px', sm: '30px 24px' } }}
          raised={true}
        >
          <DonorCreateUpdateForm donor={donor} />
        </Card>
      </Container>
      <DonorDeleteDialog />
    </DonorsProvider>
  );
}
