import { ROUTE_PATHS } from '@/routes';
import { Stack, Typography } from '@mui/material';
import Link from 'next/link';
import { Donor } from '@/generated/prisma/browser';
import React from 'react';
import { MdArrowBack } from 'react-icons/md';

interface Props {
  donor: Donor;
}
export const DonorDetailsHeader = ({ donor }: Props) => {
  return (
    <Typography variant='h1'>
      <Stack direction='row' alignItems='center' gap={1}>
        <Link href={`${ROUTE_PATHS.PROTECTED.DONORS.path}`}>
          <MdArrowBack size={24} />
        </Link>
        <>
          {donor.firstName} {donor.lastName}
        </>
      </Stack>
    </Typography>
  );
};
