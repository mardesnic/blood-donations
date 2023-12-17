import React from 'react';
import { ROUTE_PATHS } from '@/routes';
import { Breadcrumbs, Typography } from '@mui/material';
import Link from 'next/link';
import { Donation } from '@prisma/client';

interface Props {
  donation: Donation;
}

export const DonationDetailsHeader = ({ donation }: Props) => {
  return (
    <Breadcrumbs sx={{ mb: 4 }}>
      <Link href={ROUTE_PATHS.PROTECTED.DONATIONS.path}>Donations</Link>
      <Typography>{donation.id}</Typography>
    </Breadcrumbs>
  );
};
