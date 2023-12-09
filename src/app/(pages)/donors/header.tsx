'use client';

import { useDonorsContext } from '@/context/DonorsContext';
import { Button, Stack, Typography } from '@mui/material';
import React from 'react';
import { MdAdd } from 'react-icons/md';

export const DonorsHeader = () => {
  const { openDialog } = useDonorsContext();
  return (
    <Stack
      direction='row'
      justifyContent='space-between'
      alignItems='center'
      mb={2}
    >
      <Typography variant='h1'>Donors</Typography>
      <Button
        startIcon={<MdAdd />}
        onClick={() => openDialog({ type: 'create' })}
      >
        Create
      </Button>
    </Stack>
  );
};
