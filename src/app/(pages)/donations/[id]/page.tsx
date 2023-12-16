import { Metadata } from 'next';
import DonationService from '@/app/api/donations/service';
import { generatePageTitle } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { DonationDetailsHeader } from './header';
import { DonationDetailsForm } from '../forms/details';

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
      <DonationDetailsHeader donation={donation} />
      <DonationDetailsForm donation={donation} />
    </>
  );
}
