'use client';

import { useDonationsContext } from '@/context/DonationsContext';
import {
  AppBar,
  Container,
  Dialog,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';
import React from 'react';
import { MdClose } from 'react-icons/md';
import { DonationForm } from '../form';

export const DonationCreateDialog = () => {
  const { closeDialog, activeDialog } = useDonationsContext();

  if (activeDialog?.type !== 'create') {
    return null;
  }

  return (
    <Dialog open={true} onClose={closeDialog} fullScreen>
      <AppBar color='default' position='relative'>
        <Toolbar>
          <IconButton edge='start' color='inherit' onClick={closeDialog}>
            <MdClose />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
            New Donation
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth={'sm'}>
        <DonationForm />
      </Container>
    </Dialog>
  );
};
