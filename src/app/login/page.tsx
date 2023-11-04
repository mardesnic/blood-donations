import { Metadata } from 'next';
import { LoginForm } from './form';
import { generatePageTitle } from '@/lib/utils';

export const metadata: Metadata = {
  title: generatePageTitle('Login'),
};

export default function LoginPage() {
  return <LoginForm />;
}
