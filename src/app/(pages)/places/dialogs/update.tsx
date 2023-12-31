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
import { CreateUpdatePlaceForm } from '../forms/createUpdate';

export const PlaceUpdateDialog = () => {
  const { closeDialog, activeDialog } = usePlacesContext();

  if (activeDialog?.type !== 'update') {
    return null;
  }

  const { place } = activeDialog;

  return (
    <Dialog open={true} onClose={closeDialog} fullScreen>
      <AppBar color='default' position='sticky'>
        <Toolbar>
          <IconButton edge='start' color='inherit' onClick={closeDialog}>
            <MdClose />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
            {place.title}
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth={'sm'} sx={{ pt: 2, pb: 3 }}>
        <CreateUpdatePlaceForm place={place} />
      </Container>
    </Dialog>
  );
};
