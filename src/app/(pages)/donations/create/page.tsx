import { Metadata } from 'next';
import { generatePageTitle } from '@/lib/utils';
import { DonationsProvider } from '@/context/DonationsContext';
import { CreateDonationHeader } from './header';
import CreateDonationBody from './body';
import { Container } from '@mui/material';
import ActionService from '@/app/api/actions/service';

export const metadata: Metadata = {
  title: generatePageTitle('New Donation'),
};

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
