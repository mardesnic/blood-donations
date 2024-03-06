import { redirect } from 'next/navigation';
import { ROUTE_PATHS } from '@/routes';

export default async function Home() {
  return redirect(ROUTE_PATHS.PROTECTED.DONORS.path);
}
