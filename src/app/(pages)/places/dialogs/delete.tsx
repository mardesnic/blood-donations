'use client';

import { usePlacesContext } from '@/context/PlacesContext';
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

export const PlaceDeleteDialog = () => {
  const { closeDialog, activeDialog, removePlace, isLoading } =
    usePlacesContext();

  if (activeDialog?.type !== 'delete') {
    return null;
  }

  const {
    place: { id, title },
  } = activeDialog;

  const onSubmit = async () => {
    await removePlace(id);
    closeDialog();
  };

  return (
    <Dialog open={true} onClose={closeDialog}>
      <DialogTitle>Delete Place</DialogTitle>
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
