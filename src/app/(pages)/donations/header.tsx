'use client';

import { ROUTE_PATHS } from '@/routes';
import { Button, Stack, Typography } from '@mui/material';
import React from 'react';
import { MdAdd } from 'react-icons/md';
import Link from 'next/link';
import { useDonationsContext } from '@/context/DonationsContext';

export const DonationsHeader = () => {
  // On an action's page, a new donation belongs to that action.
  const { action } = useDonationsContext();
  const createPath = `${ROUTE_PATHS.PROTECTED.DONATIONS.path}/create`;
  const href = action
    ? `${createPath}?${new URLSearchParams({ actionId: action.id })}`
    : createPath;
  return (
    <Stack direction='row' justifyContent='space-between' alignItems='center'>
      <Typography variant='h1'>Donations</Typography>
      <Link href={href}>
        <Button color='secondary' size='medium' startIcon={<MdAdd />}>
          New Donation
        </Button>
      </Link>
    </Stack>
  );
};
