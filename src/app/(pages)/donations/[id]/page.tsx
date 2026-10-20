import { Metadata } from 'next';
import DonationService from '@/app/api/donations/service';
import { getTranslations } from 'next-intl/server';
import { pageTitle } from '@/i18n/metadata';
import { notFound } from 'next/navigation';
import { UpdateDonationHeader } from './header';
import { Container, Typography } from '@mui/material';
import { DonationsProvider } from '@/context/DonationsContext';
import UpdateDonationBody from './body';
import { DonationDeleteDialog } from '../dialogs/delete';
import { formatAppDateTime } from '@/lib/dates';
import { userName } from '@/lib/users';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const donation = await DonationService.findOne(id);
  const t = await getTranslations('pageTitles');
  return {
    title: await pageTitle(
      t('donation', { name: donation?.donor?.fullName || '' })
    ),
  };
}

export default async function DonationDetails({ params }: Props) {
  const { id } = await params;
  const donation = await DonationService.findOne(id);
  if (!donation) {
    notFound();
  }
  const t = await getTranslations('donations');
  // Saving sets updatedAt a moment after createdAt, so only a later change
  // counts as one.
  const changed =
    donation.updatedAt.getTime() - donation.createdAt.getTime() > 1000;

  return (
    <DonationsProvider>
      <Container component='main' maxWidth='sm' disableGutters>
        <UpdateDonationHeader donation={donation} />
        <UpdateDonationBody donation={donation} />
        <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
          {[
            donation.createdBy
              ? t('recordedBy', {
                  date: formatAppDateTime(donation.createdAt),
                  name: userName(donation.createdBy),
                })
              : t('recorded', { date: formatAppDateTime(donation.createdAt) }),
            changed &&
              t('changed', { date: formatAppDateTime(donation.updatedAt) }),
          ]
            .filter(Boolean)
            .join(' · ')}
        </Typography>
      </Container>
      <DonationDeleteDialog />
    </DonationsProvider>
  );
}
