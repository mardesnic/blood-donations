import { Metadata } from 'next';
import { generatePageTitle } from '@/lib/utils';
import { Typography } from '@mui/material';
import { PageWrapper } from '@/components/PageWrapper';
import PlaceService from '../api/places/service';

export const metadata: Metadata = {
  title: generatePageTitle('Places'),
};

export default async function PlacesPage() {
  const places = await PlaceService.find();
  return (
    <PageWrapper>
      <Typography variant='h1'>Places</Typography>
      <pre>{JSON.stringify(places, null, 2)}</pre>
    </PageWrapper>
  );
}
