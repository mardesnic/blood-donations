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
import { usePathname, useRouter } from 'next/navigation';
import { ROUTE_PATHS } from '@/routes';

export const ActionDeleteDialog = () => {
  const { closeDialog, activeDialog, removeAction, isLoading } =
    useActionsContext();
  const router = useRouter();
  const pathname = usePathname();
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
    // From the action's own page, go back to the list; elsewhere (the
    // actions list, a place's page) stay and show the change.
    if (pathname === `${ROUTE_PATHS.PROTECTED.ACTIONS.path}/${id}`) {
      router.push(ROUTE_PATHS.PROTECTED.ACTIONS.path);
    }
    router.refresh();
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
