'use client';

import { useActionsContext } from '@/context/ActionsContext';
import { Button, Stack, Typography } from '@mui/material';
import React from 'react';
import { MdAdd } from 'react-icons/md';
import { useTranslations } from 'next-intl';

export const ActionsHeader = () => {
  const { openDialog } = useActionsContext();
  const t = useTranslations();
  return (
    <Stack
      direction='row'
      justifyContent='space-between'
      alignItems='center'
      mb={2}
    >
      <Typography variant='h1'>{t('actions.title')}</Typography>
      <Button
        startIcon={<MdAdd />}
        onClick={() => openDialog({ type: 'create' })}
      >
        {t('common.create')}
      </Button>
    </Stack>
  );
};
