'use client';

import { usePlacesContext } from '@/context/PlacesContext';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { PlaceCreateUpdateForm } from '../forms/createUpdate';

export const PlaceCreateUpdateDialog = () => {
  const t = useTranslations('places');
  const router = useRouter();
  const { closeDialog, activeDialog, createPlace, updatePlace, isLoading } =
    usePlacesContext();

  if (activeDialog?.type !== 'create' && activeDialog?.type !== 'update') {
    return null;
  }
  const place = activeDialog.type === 'update' ? activeDialog.place : null;

  return (
    <Dialog open={true} onClose={closeDialog} fullWidth maxWidth='sm'>
      <DialogTitle>{place ? place.title : t('new')}</DialogTitle>
      <DialogContent>
        <PlaceCreateUpdateForm
          place={place}
          isLoading={isLoading}
          onCancel={closeDialog}
          onSubmit={async (values) => {
            if (place) {
              await updatePlace({ ...values, id: place.id });
            } else {
              await createPlace(values);
            }
            closeDialog();
            // The place's own page is rendered on the server.
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
