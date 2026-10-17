'use client';

import { usePlacesContext } from '@/context/PlacesContext';
import { Button, Stack, Typography } from '@mui/material';
import React from 'react';
import { MdAdd } from 'react-icons/md';
import { useTranslations } from 'next-intl';

export const PlacesHeader = () => {
  const { openDialog } = usePlacesContext();
  const t = useTranslations();
  return (
    <Stack
      direction='row'
      justifyContent='space-between'
      alignItems='center'
      mb={2}
    >
      <Typography variant='h1'>{t('places.title')}</Typography>
      <Button
        startIcon={<MdAdd />}
        onClick={() => openDialog({ type: 'create' })}
      >
        {t('common.create')}
      </Button>
    </Stack>
  );
};
