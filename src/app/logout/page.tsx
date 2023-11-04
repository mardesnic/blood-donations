import { Metadata } from 'next';
import { LogoutForm } from './form';
import { generatePageTitle } from '@/lib/utils';

export const metadata: Metadata = {
  title: generatePageTitle('Logout'),
};

export default function LogoutPage() {
  return <LogoutForm />;
}
