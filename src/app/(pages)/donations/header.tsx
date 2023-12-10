'use client';

import { useDonationsContext } from '@/context/DonationsContext';
import { Button, Stack, Typography } from '@mui/material';
import React from 'react';
import { MdAdd } from 'react-icons/md';

export const DonationsHeader = () => {
  const { openDialog } = useDonationsContext();
  return (
    <Stack
      direction='row'
      justifyContent='space-between'
      alignItems='center'
      mb={2}
    >
      <Typography variant='h1'>Donations</Typography>
      <Button
        startIcon={<MdAdd />}
        onClick={() => openDialog({ type: 'create' })}
      >
        Create
      </Button>
    </Stack>
  );
};
