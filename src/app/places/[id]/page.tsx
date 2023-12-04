import { Metadata } from 'next';
import { PageWrapper } from '@/components/PageWrapper';
import PlaceService from '@/app/api/places/service';
import { generatePageTitle } from '@/lib/utils';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { ROUTE_PATHS } from '@/routes';
import { notFound } from 'next/navigation';

type Props = {
  params: { id: string };
};

export async function generateMetadata({
  params: { id },
}: Props): Promise<Metadata> {
  const place = await PlaceService.findOne(id);
  return {
    title: generatePageTitle(place?.title),
  };
}

export default async function PlaceDetails({ params: { id } }: Props) {
  const place = await PlaceService.findOne(id);
  if (!place) {
    notFound();
  }
  return (
    <PageWrapper>
      <Breadcrumbs>
        <Link href={ROUTE_PATHS.PROTECTED.PLACES.path}>Places</Link>
        <Typography>{place.title}</Typography>
      </Breadcrumbs>
      <pre>{JSON.stringify(place, null, 2)}</pre>
    </PageWrapper>
  );
}
