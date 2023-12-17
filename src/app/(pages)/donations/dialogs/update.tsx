'use client';

import { useDonationsContext } from '@/context/DonationsContext';
import { AppBar, Container, Dialog, IconButton, Toolbar } from '@mui/material';
import React from 'react';
import { MdClose } from 'react-icons/md';
import { DonationCreateUpdateForm } from '../forms/createUpdate';

export const DonationUpdateDialog = () => {
  const { closeDialog, activeDialog } = useDonationsContext();

  if (activeDialog?.type !== 'update') {
    return null;
  }

  const { donation } = activeDialog;

  return (
    <Dialog open={true} onClose={closeDialog} fullScreen>
      <AppBar color='default' position='relative'>
        <Toolbar>
          <IconButton edge='start' color='inherit' onClick={closeDialog}>
            <MdClose />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth={'sm'}>
        <DonationCreateUpdateForm donation={donation} />
      </Container>
    </Dialog>
  );
};
