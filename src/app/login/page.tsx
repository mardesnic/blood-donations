import { Metadata } from 'next';
import { LoginForm } from './form';
import { generatePageTitle } from '@/lib/utils';
import { Container } from '@/components/layout/Container';

export const metadata: Metadata = {
  title: generatePageTitle('Login'),
};

export default function LoginPage() {
  return (
    <Container>
      <LoginForm />
    </Container>
  );
}
