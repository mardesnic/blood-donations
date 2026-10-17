import React from 'react';
import { ROUTE_PATHS } from '@/routes';
import { Breadcrumbs, Typography } from '@mui/material';
import Link from 'next/link';
import { ActionWithPlace } from '@/context/ActionsContext';
import { useTranslations } from 'next-intl';

interface Props {
  action: ActionWithPlace;
}

export const ActionDetailsHeader = ({ action }: Props) => {
  const t = useTranslations('nav');
  return (
    <Breadcrumbs sx={{ mb: 4 }}>
      <Link href={ROUTE_PATHS.PROTECTED.ACTIONS.path}>{t('actions')}</Link>
      <Typography>{action.title}</Typography>
    </Breadcrumbs>
  );
};
