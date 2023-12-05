'use client';

import { useActionsContext } from '@/context/ActionsContext';
import { Button, Stack, Typography } from '@mui/material';
import React from 'react';
import { MdAdd } from 'react-icons/md';

export const ActionsHeader = () => {
  const { openDialog } = useActionsContext();
  return (
    <Stack
      direction='row'
      justifyContent='space-between'
      alignItems='center'
      mb={2}
    >
      <Typography variant='h1'>Actions</Typography>
      <Button
        startIcon={<MdAdd />}
        onClick={() => openDialog({ type: 'create' })}
      >
        Create
      </Button>
    </Stack>
  );
};
