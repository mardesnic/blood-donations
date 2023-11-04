import { Metadata } from 'next';
import { LogoutForm } from './form';
import { generatePageTitle } from '@/lib/utils';
import { Container } from '@/components/layout/Container';
import { Heading } from '@/components/typography/Heading';
import { Stack } from '@/components/layout/Stack';

export const metadata: Metadata = {
  title: generatePageTitle('Logout'),
};

export default async function LogoutPage() {
  return (
    <Container>
      <Stack>
        <Heading>Are you sure you want to sign out?</Heading>
        <LogoutForm />
      </Stack>
    </Container>
  );
}
