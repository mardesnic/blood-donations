import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Container } from '@mui/material';
import { pageTitle } from '@/i18n/metadata';
import { getCurrentUser } from '@/app/api/auth/service';
import { ChangePasswordForm } from './form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pageTitles');
  return { title: await pageTitle(t('changePassword')) };
}

// The user's own password. Users with a temporary password are sent here
// (by the proxy) until they replace it.
export default async function ChangePasswordPage() {
  const user = await getCurrentUser();
  return (
    <Container component='main' maxWidth='xs' disableGutters>
      <ChangePasswordForm temporary={!!user?.mustChangePassword} />
    </Container>
  );
}
