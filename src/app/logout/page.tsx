import { Metadata } from 'next';
import { LogoutForm } from './form';
import { generatePageTitle } from '@/lib/utils';
import { Stack, Typography } from '@mui/material';
import { PageWrapper } from '@/components/PageWrapper';

export const metadata: Metadata = {
  title: generatePageTitle('Logout'),
};

export default async function LogoutPage() {
  return (
    <PageWrapper>
      <Stack gap={2}>
        <Typography variant='h3'>Are you sure you want to sign out?</Typography>
        <LogoutForm />
      </Stack>
    </PageWrapper>
  );
}
