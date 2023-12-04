'use client';

import { useActionsContext } from '@/context/ActionsContext';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import React from 'react';
import { MdDelete } from 'react-icons/md';

export const ActionDeleteDialog = () => {
  const { closeDialog, activeDialog, removeAction, isLoading } =
    useActionsContext();

  if (activeDialog?.type !== 'delete') {
    return null;
  }

  const {
    action: { id, title },
  } = activeDialog;

  const onSubmit = async () => {
    await removeAction(id);
    closeDialog();
  };

  return (
    <Dialog open={true} onClose={closeDialog}>
      <DialogTitle>Delete Action</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete <strong>{title}</strong>?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant='outlined' disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          autoFocus
          disabled={isLoading}
          startIcon={<MdDelete />}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
