'use client';

import { ROUTE_PATHS } from '@/routes';
import { Button, Stack, Typography } from '@mui/material';
import React from 'react';
import { MdAdd } from 'react-icons/md';
import Link from 'next/link';
import { useDonationsContext } from '@/context/DonationsContext';
import { useTranslations } from 'next-intl';

export const DonationsHeader = () => {
  // On an action's or a donor's page, a new donation belongs to them.
  const { action, donor } = useDonationsContext();
  const t = useTranslations('donations');
  const createPath = `${ROUTE_PATHS.PROTECTED.DONATIONS.path}/create`;
  const params = new URLSearchParams();
  if (action) {
    params.set('actionId', action.id);
  }
  if (donor) {
    params.set('donorId', donor.id);
  }
  const href = params.size ? `${createPath}?${params}` : createPath;
  return (
    <Stack
      direction='row'
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Typography variant='h1'>{t('title')}</Typography>
      <Link href={href}>
        <Button color='secondary' size='medium' startIcon={<MdAdd />}>
          {t('new')}
        </Button>
      </Link>
    </Stack>
  );
};
