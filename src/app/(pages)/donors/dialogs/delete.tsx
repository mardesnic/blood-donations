'use client';

import { useDonorsContext } from '@/context/DonorsContext';
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

export const DonorDeleteDialog = () => {
  const { closeDialog, activeDialog, removeDonor, isLoading } =
    useDonorsContext();

  if (activeDialog?.type !== 'delete') {
    return null;
  }

  const {
    donor: { id, firstName },
  } = activeDialog;

  const onSubmit = async () => {
    await removeDonor(id);
    closeDialog();
  };

  return (
    <Dialog open={true} onClose={closeDialog}>
      <DialogTitle>Delete Donor</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete donor
          <strong>{` ${firstName}` || ''}</strong>?
        </DialogContentText>
        <DialogContentText>
          This will delete all donor donations and communications.
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
