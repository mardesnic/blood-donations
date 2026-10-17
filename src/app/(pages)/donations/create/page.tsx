import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { pageTitle } from '@/i18n/metadata';
import { DonationsProvider } from '@/context/DonationsContext';
import { CreateDonationHeader } from './header';
import CreateDonationBody from './body';
import { Container } from '@mui/material';
import ActionService from '@/app/api/actions/service';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pageTitles');
  return { title: await pageTitle(t('newDonation')) };
}

type Props = {
  searchParams: Promise<{ actionId?: string | string[] }>;
};

export default async function CreateDonationPage({ searchParams }: Props) {
  // Opened from an action's page: preselect that action.
  const { actionId } = await searchParams;
  const action =
    typeof actionId === 'string' && actionId
      ? await ActionService.findOne(actionId)
      : null;
  return (
    <DonationsProvider action={action ?? undefined}>
      <Container component='main' maxWidth='sm'>
        <CreateDonationHeader />
        <CreateDonationBody />
      </Container>
    </DonationsProvider>
  );
}
