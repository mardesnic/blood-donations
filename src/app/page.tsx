import Link from 'next/link';
import { getCurrentSession } from './api/auth/service';
import { ROUTE_PATHS } from '@/routes';

export default async function Home() {
  const session = await getCurrentSession();
  return (
    <p>
      Welcome, {session.user?.email}{' '}
      <Link href={ROUTE_PATHS.PUBLIC.LOGOUT}>(sign out)</Link>
    </p>
  );
}
