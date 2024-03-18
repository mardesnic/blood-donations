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
import { useRouter } from 'next/navigation';
import { ROUTE_PATHS } from '@/routes';

export const DonationDeleteDialog = () => {
  const router = useRouter();

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
    router.push(`${ROUTE_PATHS.PROTECTED.DONATIONS.path}`);
  };

  return (
    <Dialog open={true} onClose={closeDialog}>
      <DialogTitle>Delete Donation</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This action cannot be undone. Deleting the donation will permanently
          remove all associated information.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={closeDialog}
          variant='outlined'
          disabled={isLoading}
          color='secondary'
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          autoFocus
          disabled={isLoading}
          startIcon={<MdDelete />}
        >
          Yes, Delete Donation
        </Button>
      </DialogActions>
    </Dialog>
  );
};
