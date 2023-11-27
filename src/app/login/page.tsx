import { Metadata } from 'next';
import { generatePageTitle } from '@/lib/utils';
import { LoginForm } from '@/app/login/form';
import { Stack, Typography } from '@mui/material';

export const metadata: Metadata = {
  title: generatePageTitle('Login'),
};

export default function LoginPage() {
  return (
    <Stack alignItems='center' gap={1} sx={{ marginTop: 8 }}>
      <Typography variant='h1'>Sign in</Typography>
      <LoginForm />
    </Stack>
  );
}
