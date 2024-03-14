import { Metadata } from 'next';
import DonorService from '@/app/api/donors/service';
import { generatePageTitle, getDisplayName } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { DonorDetailsHeader } from './header';

import { Container } from '@mui/material';
import { DonorsProvider } from '@/context/DonorsContext';
import React from 'react';
import UpdateDonorBody from './body';

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

export default async function DonorsDetailsPage({ params: { id } }: Props) {
  const donor = await DonorService.findOne(id);
  if (!donor) {
    notFound();
  }
  return (
    <DonorsProvider>
      <Container component='main' maxWidth='sm'>
        <DonorDetailsHeader donor={donor} />
        <UpdateDonorBody donor={donor} />
      </Container>
    </DonorsProvider>
  );
}
