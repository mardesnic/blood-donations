'use client';

import { ROUTE_PATHS } from '@/routes';
import { Button, Stack, Typography } from '@mui/material';
import React from 'react';
import { MdAdd } from 'react-icons/md';
import Link from 'next/link';

export const DonationsHeader = () => {
  return (
    <Stack direction='row' justifyContent='space-between' alignItems='center'>
      <Typography variant='h1'>Donations</Typography>
      <Link href={`${ROUTE_PATHS.PROTECTED.DONATIONS.path}/create`}>
        <Button color='secondary' size='medium' startIcon={<MdAdd />}>
          New Donation
        </Button>
      </Link>
    </Stack>
  );
};
