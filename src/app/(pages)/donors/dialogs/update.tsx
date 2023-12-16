'use client';

import { useDonorsContext } from '@/context/DonorsContext';
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
import { DonorCreateUpdateForm } from '../forms/createUpdate';

export const DonorUpdateDialog = () => {
  const { closeDialog, activeDialog } = useDonorsContext();

  if (activeDialog?.type !== 'update') {
    return null;
  }

  const { donor } = activeDialog;

  return (
    <Dialog open={true} onClose={closeDialog} fullScreen>
      <AppBar color='default' position='sticky'>
        <Toolbar>
          <IconButton edge='start' color='inherit' onClick={closeDialog}>
            <MdClose />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
            {donor.firstName}
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth={'sm'} sx={{ pt: 2, pb: 3 }}>
        <DonorCreateUpdateForm donor={donor} />
      </Container>
    </Dialog>
  );
};
