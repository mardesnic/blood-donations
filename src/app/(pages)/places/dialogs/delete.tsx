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
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ROUTE_PATHS } from '@/routes';

export const PlaceDeleteDialog = () => {
  const t = useTranslations();
  const router = useRouter();
  const { closeDialog, activeDialog, removePlace, isLoading } =
    usePlacesContext();

  if (activeDialog?.type !== 'delete') {
    return null;
  }

  const {
    place: { id, title },
    actionCount,
  } = activeDialog;

  const onSubmit = async () => {
    await removePlace(id);
    closeDialog();
    // From the place's own page, go back to the list.
    router.push(ROUTE_PATHS.PROTECTED.PLACES.path);
    router.refresh();
  };

  return (
    <Dialog open={true} onClose={closeDialog}>
      <DialogTitle>{t('places.deleteTitle')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t.rich('places.deleteText', {
            title,
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </DialogContentText>
        <DialogContentText sx={{ mt: 1 }}>
          {t('places.deleteActions', { count: actionCount })}
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
