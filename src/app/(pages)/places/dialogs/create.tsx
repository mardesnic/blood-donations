'use client';

import { usePlacesContext } from '@/context/PlacesContext';
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
import { PlaceCreateForm } from '../forms/create';

export const PlaceCreateDialog = () => {
  const { closeDialog, activeDialog } = usePlacesContext();

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
            New Place
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth={'sm'}>
        <PlaceCreateForm />
      </Container>
    </Dialog>
  );
};
