import { Metadata } from 'next';
import { generatePageTitle } from '@/lib/utils';
import { PageWrapper } from '@/components/PageWrapper';

export const metadata: Metadata = {
  title: generatePageTitle('New Action'),
};

export default async function ActionsPage() {
  return <PageWrapper>New Action</PageWrapper>;
}
