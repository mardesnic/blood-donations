import { Metadata } from 'next';
import DonorService from '@/app/api/donors/service';
import { generatePageTitle, getDisplayName } from '@/lib/utils';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { ROUTE_PATHS } from '@/routes';
import { notFound } from 'next/navigation';

type Props = {
  params: { id: string };
};

export async function generateMetadata({
  params: { id },
}: Props): Promise<Metadata> {
  const donor = await DonorService.findOne(id);
  return {
    title: generatePageTitle(
      getDisplayName([donor?.firstName || '', donor?.lastName || ''])
    ),
  };
}

export default async function DonorDetails({ params: { id } }: Props) {
  const donor = await DonorService.findOne(id);
  if (!donor) {
    notFound();
  }
  return (
    <>
      <Breadcrumbs>
        <Link href={ROUTE_PATHS.PROTECTED.DONORS.path}>Donors</Link>
        <Typography>
          {getDisplayName([donor?.firstName || '', donor?.lastName || ''])}
        </Typography>
      </Breadcrumbs>
      <pre>{JSON.stringify(donor, null, 2)}</pre>
    </>
  );
}
