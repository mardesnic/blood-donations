import { getDisplayName } from '@/lib/utils';
import { ROUTE_PATHS } from '@/routes';
import { Breadcrumbs, Typography } from '@mui/material';
import Link from 'next/link';
import { Donor } from '@prisma/client';
import React from 'react';

interface Props {
  donor: Donor;
}

export const DonorDetailsHeader = ({ donor }: Props) => {
  return (
    <Breadcrumbs sx={{ mb: 4 }}>
      <Link href={ROUTE_PATHS.PROTECTED.DONORS.path}>Donors</Link>
      <Typography>
        {getDisplayName([donor?.firstName || '', donor?.lastName || ''])}
      </Typography>
    </Breadcrumbs>
  );
};
