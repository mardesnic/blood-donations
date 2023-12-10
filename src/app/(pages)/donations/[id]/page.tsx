import { Metadata } from 'next';
import DonationService from '@/app/api/donations/service';
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
  const donation = await DonationService.findOne(id);
  return {
    title: generatePageTitle(donation?.id),
  };
}

export default async function DonationDetails({ params: { id } }: Props) {
  const donation = await DonationService.findOne(id);
  if (!donation) {
    notFound();
  }
  return (
    <>
      <Breadcrumbs>
        <Link href={ROUTE_PATHS.PROTECTED.DONATIONS.path}>Donations</Link>
        <Typography>{donation.id}</Typography>
      </Breadcrumbs>
      <pre>{JSON.stringify(donation, null, 2)}</pre>
    </>
  );
}
