'use client';

import { Button, Stack, Typography } from '@mui/material';
import React from 'react';
import { MdAdd } from 'react-icons/md';
import Link from 'next/link';

import { ROUTE_PATHS } from '@/routes';

export const DonorsHeader = () => {
  return (
    <Stack direction='row' justifyContent='space-between' alignItems='center'>
      <Typography variant='h1'>Donors</Typography>
      <Stack direction='row' gap={2}>
        <Button variant='outlined' size='medium' color='inherit'>
          Export CSV
        </Button>
        <Link href={`${ROUTE_PATHS.PROTECTED.DONORS.path}/create`}>
          <Button color='secondary' size='medium' startIcon={<MdAdd />}>
            New Donor
          </Button>
        </Link>
      </Stack>
    </Stack>
  );
};
