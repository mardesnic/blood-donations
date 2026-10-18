'use client';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React from 'react';
import { useTranslations } from 'next-intl';
import { Place } from '@/generated/prisma/browser';
import { useCreatePlace } from '@/hooks/usePlaces';
import { PlaceCreateUpdateForm } from '../forms/createUpdate';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (place: Place) => void;
}

// Adds a place without leaving the form that needs it (e.g. a new action).
export const PlaceQuickAddDialog = ({ open, onClose, onCreated }: Props) => {
  const t = useTranslations('places');
  const { mutateAsync: createPlace, isPending } = useCreatePlace();
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='sm'
      // Full screen on phones, like the action form it opens from.
      fullScreen={isPhone}
      // A fresh, empty form each time it opens.
      keepMounted={false}
    >
      <DialogTitle>{t('new')}</DialogTitle>
      <DialogContent>
        <PlaceCreateUpdateForm
          isLoading={isPending}
          onCancel={onClose}
          onSubmit={async (values) => {
            onCreated(await createPlace(values));
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
