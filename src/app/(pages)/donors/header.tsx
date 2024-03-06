'use client';

import { Button, Stack, Typography } from '@mui/material';
import React from 'react';
import { MdAdd } from 'react-icons/md';

export const DonorsHeader = () => {
  return (
    <Stack direction='row' justifyContent='space-between' alignItems='center'>
      <Typography variant='h1'>Donors</Typography>
      <Stack direction='row' gap={2}>
        <Button variant='outlined' size='medium' color='inherit'>
          Export CSV
        </Button>
        <Button color='secondary' size='medium' startIcon={<MdAdd />}>
          New Donor
        </Button>
      </Stack>
    </Stack>
  );
};
