import { Metadata } from 'next';
import { generatePageTitle } from '@/lib/utils';
import { LoginForm } from '@/app/login/form';


export const metadata: Metadata = {
  title: generatePageTitle('Login'),
};

export default function LoginPage() {
  return (
      <LoginForm />
  );
}
