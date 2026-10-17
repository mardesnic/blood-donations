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
import { useTranslations } from 'next-intl';

export const ActionDeleteDialog = () => {
  const { closeDialog, activeDialog, removeAction, isLoading } =
    useActionsContext();
  const t = useTranslations();

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
      <DialogTitle>{t('actions.deleteTitle')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t.rich('actions.deleteText', {
            title,
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} variant='outlined' disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={onSubmit}
          autoFocus
          disabled={isLoading}
          startIcon={<MdDelete />}
        >
          {t('common.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
