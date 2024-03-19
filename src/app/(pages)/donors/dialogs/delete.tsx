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
import { useRouter } from 'next/navigation';
import { ROUTE_PATHS } from '@/routes';

export const DonorDeleteDialog = () => {
  const router = useRouter();

  const { closeDialog, activeDialog, removeDonor, isLoading } =
    useDonorsContext();

  if (activeDialog?.type !== 'delete') {
    return null;
  }

  const {
    donor: { id, firstName, lastName },
  } = activeDialog;

  const onSubmit = async () => {
    await removeDonor(id);
    closeDialog();
    router.push(`${ROUTE_PATHS.PROTECTED.DONORS.path}`);
  };

  return (
    <Dialog open={true} onClose={closeDialog}>
      <DialogTitle>
        Delete {firstName} {lastName} Account?
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          This action cannot be undone. Deleting the donor will permanently
          remove all associated information, including donations and contact
          details.
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
          Yes, Delete Account
        </Button>
      </DialogActions>
    </Dialog>
  );
};
