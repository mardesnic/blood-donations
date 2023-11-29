import { Metadata } from 'next';
import { generatePageTitle } from '@/lib/utils';
import { Typography } from '@mui/material';
import { PageWrapper } from '@/components/PageWrapper';
import PlacesTable from './table';
import { PlacesProvider } from '@/context/PlacesContext';

export const metadata: Metadata = {
  title: generatePageTitle('Places'),
};

export default async function PlacesPage() {
  return (
    <PageWrapper>
      <Typography variant='h1'>Places</Typography>
      <PlacesProvider>
        <PlacesTable />
      </PlacesProvider>
    </PageWrapper>
  );
}
