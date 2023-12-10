'use client';

import { useDonationsContext } from '@/context/DonationsContext';
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

export const DonationDeleteDialog = () => {
  const { closeDialog, activeDialog, removeDonation, isLoading } =
    useDonationsContext();

  if (activeDialog?.type !== 'delete') {
    return null;
  }

  const {
    donation: { id },
  } = activeDialog;

  const onSubmit = async () => {
    await removeDonation(id);
    closeDialog();
  };

  return (
    <Dialog open={true} onClose={closeDialog}>
      <DialogTitle>Delete Donation</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this donation?
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
