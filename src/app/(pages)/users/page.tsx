import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Container } from '@mui/material';
import { pageTitle } from '@/i18n/metadata';
import { getCurrentUser } from '@/app/api/auth/service';
import { isAdmin } from '@/lib/users';
import { UsersList } from './usersList';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pageTitles');
  return { title: await pageTitle(t('users')) };
}

// Who can sign in to the app. Admins only.
export default async function UsersPage() {
  if (!isAdmin(await getCurrentUser())) {
    notFound();
  }
  return (
    <Container component='main' maxWidth='md' disableGutters>
      <UsersList />
    </Container>
  );
}
