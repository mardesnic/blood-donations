import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { pageTitle } from '@/i18n/metadata';
import { LoginForm } from '@/app/login/form';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Box, Container, Stack, Typography } from '@mui/material';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pageTitles');
  return { title: await pageTitle(t('login')) };
}

export default async function LoginPage() {
  const t = await getTranslations('login');
  return (
    <Container component='main' maxWidth='xl'>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
        <LanguageSwitcher color='secondary' />
      </Box>
      <Stack
        sx={{
          alignItems: 'center',
          gap: 1,
          marginTop: 6,
        }}
      >
        <Typography variant='h1'>{t('title')}</Typography>
        <LoginForm />
      </Stack>
    </Container>
  );
}
