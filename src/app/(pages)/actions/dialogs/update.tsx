'use client';

import { useActionsContext } from '@/context/ActionsContext';
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
import { ActionCreateUpdateForm } from '../forms/createUpdate';

export const ActionUpdateDialog = () => {
  const { closeDialog, activeDialog } = useActionsContext();

  if (activeDialog?.type !== 'update') {
    return null;
  }

  const { action } = activeDialog;

  return (
    <Dialog open={true} onClose={closeDialog} fullScreen>
      <AppBar color='default' position='relative'>
        <Toolbar>
          <IconButton edge='start' color='inherit' onClick={closeDialog}>
            <MdClose />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
            {action.title}
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth={'sm'}>
        <ActionCreateUpdateForm action={action} />
      </Container>
    </Dialog>
  );
};
