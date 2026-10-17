'use client';

import { useActionsContext } from '@/context/ActionsContext';
import { Button, Stack, Typography } from '@mui/material';
import React from 'react';
import { MdAdd } from 'react-icons/md';
import { useTranslations } from 'next-intl';

export const ActionsHeader = () => {
  const { openDialog } = useActionsContext();
  const t = useTranslations('actions');
  return (
    <Stack direction='row' justifyContent='space-between' alignItems='center'>
      <Typography variant='h1'>{t('title')}</Typography>
      <Button
        color='secondary'
        size='medium'
        startIcon={<MdAdd />}
        onClick={() => openDialog({ type: 'create' })}
      >
        {t('new')}
      </Button>
    </Stack>
  );
};
