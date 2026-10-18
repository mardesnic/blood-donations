import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { pageTitle } from '@/i18n/metadata';
import { DonationsProvider } from '@/context/DonationsContext';
import { CreateDonationHeader } from './header';
import CreateDonationBody from './body';
import { Container } from '@mui/material';
import ActionService from '@/app/api/actions/service';
import DonorService from '@/app/api/donors/service';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pageTitles');
  return { title: await pageTitle(t('newDonation')) };
}

type Props = {
  searchParams: Promise<{
    actionId?: string | string[];
    donorId?: string | string[];
  }>;
};

export default async function CreateDonationPage({ searchParams }: Props) {
  // Opened from an action's or a donor's page: preselect that action or
  // donor.
  const { actionId, donorId } = await searchParams;
  const action =
    typeof actionId === 'string' && actionId
      ? await ActionService.findOne(actionId)
      : null;
  const donor =
    typeof donorId === 'string' && donorId
      ? await DonorService.findOne(donorId)
      : null;
  return (
    <DonationsProvider action={action ?? undefined} donor={donor ?? undefined}>
      <Container component='main' maxWidth='sm' disableGutters>
        <CreateDonationHeader />
        <CreateDonationBody />
      </Container>
    </DonationsProvider>
  );
}
