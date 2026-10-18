import { Stack, Typography } from '@mui/material';
import { Donor } from '@/generated/prisma/browser';
import React, { ReactNode } from 'react';
import { DonorBackLink } from './backLink';

interface Props {
  donor: Donor;
  // Where the arrow goes; the donors list (as last left) by default.
  backHref?: string;
  // Shown next to the name (e.g. a status chip).
  badge?: ReactNode;
  // Buttons on the right.
  children?: ReactNode;
}

export const DonorDetailsHeader = ({
  donor,
  backHref,
  badge,
  children,
}: Props) => {
  return (
    <Stack
      direction='row'
      alignItems='center'
      justifyContent='space-between'
      flexWrap='wrap'
      gap={2}
    >
      <Typography variant='h1' sx={{ mb: 0 }}>
        <Stack direction='row' alignItems='center' gap={1}>
          <DonorBackLink href={backHref} />
          <>
            {donor.firstName} {donor.lastName}
          </>
          {badge}
        </Stack>
      </Typography>
      {children && (
        <Stack direction='row' gap={2}>
          {children}
        </Stack>
      )}
    </Stack>
  );
};
