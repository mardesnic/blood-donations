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
import { useTranslations } from 'next-intl';
import { useGoBack } from '@/hooks/useGoBack';
import { ROUTE_PATHS } from '@/routes';

export const DonationDeleteDialog = () => {
  const goBack = useGoBack(ROUTE_PATHS.PROTECTED.DONATIONS.path);

  const { closeDialog, activeDialog, removeDonation, isLoading } =
    useDonationsContext();
  const t = useTranslations();

  if (activeDialog?.type !== 'delete') {
    return null;
  }

  const {
    donation: { id },
  } = activeDialog;

  const onSubmit = async () => {
    await removeDonation(id);
    closeDialog();
    goBack();
  };

  return (
    <Dialog open={true} onClose={closeDialog}>
      <DialogTitle>{t('donations.deleteTitle')}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t('donations.deleteText')}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={closeDialog}
          variant='outlined'
          disabled={isLoading}
          color='secondary'
        >
          {t('common.cancel')}
        </Button>
        <Button
          onClick={onSubmit}
          autoFocus
          disabled={isLoading}
          startIcon={<MdDelete />}
        >
          {t('donations.deleteConfirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
