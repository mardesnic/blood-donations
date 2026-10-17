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
import { useTranslations } from 'next-intl';
import { getDisplayName } from '@/lib/utils';

export const DonorDeleteDialog = () => {
  const router = useRouter();

  const { closeDialog, activeDialog, removeDonor, isLoading } =
    useDonorsContext();
  const t = useTranslations();

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
        {t('donors.deleteTitle', {
          name: getDisplayName([firstName, lastName]),
        })}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{t('donors.deleteText')}</DialogContentText>
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
          {t('donors.deleteConfirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
