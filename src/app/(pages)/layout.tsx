import { redirect } from 'next/navigation';
import { PageWrapper } from '@/components/PageWrapper';
import { AlertPopup } from '@/components/AlertPopup';
import { getCurrentUser } from '@/app/api/auth/service';
import { CurrentUserProvider } from '@/context/CurrentUserContext';
import { ROUTE_PATHS } from '@/routes';

export default async function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The proxy only checks that the session is valid; a deactivated user's
  // session still is, so they are sent back to sign in here.
  const user = await getCurrentUser();
  if (!user) {
    redirect(ROUTE_PATHS.PUBLIC.LOGIN.path);
  }
  return (
    <CurrentUserProvider
      user={{
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }}
    >
      <PageWrapper>
        <AlertPopup />
        {children}
      </PageWrapper>
    </CurrentUserProvider>
  );
}
