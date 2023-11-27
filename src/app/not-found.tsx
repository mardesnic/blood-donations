import { PageWrapper } from '@/components/PageWrapper';
import { generatePageTitle } from '@/lib/utils';
import { Typography } from '@mui/material';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: generatePageTitle('404'),
};

export default function NotFoundPage() {
  return (
    <PageWrapper>
      <Typography variant='h1'>404 - Page not found</Typography>
    </PageWrapper>
  );
}
