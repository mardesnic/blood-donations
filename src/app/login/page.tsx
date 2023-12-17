import { Metadata } from 'next';
import { generatePageTitle } from '@/lib/utils';
import { LoginForm } from '@/app/login/form';
import { getDictionary } from '@/dictionaries';
import { Container, Stack, Typography } from '@mui/material';
import { DEFAULT_LANGUAGE } from '@/lib/const';

export const metadata: Metadata = {
  title: generatePageTitle('Login'),
};

export default async function LoginPage() {
  const dict = await getDictionary(DEFAULT_LANGUAGE); // en

  return (
    <Container component='main' maxWidth='xl'>
      <Stack alignItems='center' gap={1} sx={{ marginTop: 8 }}>
        <Typography variant='h1'>{dict.login.signIn}</Typography>
        <LoginForm />
      </Stack>
    </Container>
  );
}
