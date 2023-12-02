'use client';

import { usePlacesContext } from '@/context/PlacesContext';
import { Button, Stack, Typography } from '@mui/material';
import React from 'react';
import { MdAdd } from 'react-icons/md';

export const PlacesHeader = () => {
  const { openDialog } = usePlacesContext();
  return (
    <Stack
      direction='row'
      justifyContent='space-between'
      alignItems='center'
      mb={2}
    >
      <Typography variant='h1'>Places</Typography>
      <Button
        startIcon={<MdAdd />}
        onClick={() => openDialog({ type: 'create' })}
      >
        Create
      </Button>
    </Stack>
  );
};
