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
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Typography variant='h1'>{t('places.title')}</Typography>
      <Button
        color='secondary'
        size='medium'
        startIcon={<MdAdd />}
        onClick={() => openDialog({ type: 'create' })}
      >
        {t('places.new')}
      </Button>
    </Stack>
  );
};
