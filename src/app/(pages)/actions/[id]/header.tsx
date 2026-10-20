'use client';

import React from 'react';
import Link from 'next/link';
import { Breadcrumbs, Button, Stack, Typography } from '@mui/material';
import { MdBolt, MdDelete, MdEdit, MdPrint } from 'react-icons/md';
import { useTranslations } from 'next-intl';
import { ROUTE_PATHS } from '@/routes';
import { ActionWithPlace, useActionsContext } from '@/context/ActionsContext';
import { useCurrentUser } from '@/context/CurrentUserContext';

interface Props {
  action: ActionWithPlace;
}

// Breadcrumbs plus Edit and Delete, which open the actions dialogs.
export const ActionDetailsHeader = ({ action }: Props) => {
  const t = useTranslations();
  const { isAdmin } = useCurrentUser();
  const { openDialog, isLoading } = useActionsContext();
  return (
    <Stack
      direction='row'
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        mb: 3,
      }}
    >
      <Breadcrumbs>
        <Link href={ROUTE_PATHS.PROTECTED.ACTIONS.path} className='tap-target'>
          {t('nav.actions')}
        </Link>
        {/* Breadcrumbs grey the last item; the title stays prominent. */}
        <Typography
          variant='h1'
          component='h1'
          sx={{
            color: 'text.primary',
            mb: 0,
          }}
        >
          {action.title}
        </Typography>
      </Breadcrumbs>
      <Stack
        direction='row'
        sx={{
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {/* Quick entry of donations at the drive. */}
        <Link href={`${ROUTE_PATHS.PROTECTED.ACTIONS.path}/${action.id}/drive`}>
          <Button color='secondary' size='medium' startIcon={<MdBolt />}>
            {t('drive.open')}
          </Button>
        </Link>
        {/* Who is expected, or how it went, on paper or in Excel. */}
        <Link href={`${ROUTE_PATHS.PROTECTED.ACTIONS.path}/${action.id}/print`}>
          <Button
            variant='outlined'
            color='inherit'
            size='medium'
            startIcon={<MdPrint />}
          >
            {t('driveSheets.open')}
          </Button>
        </Link>
        <Button
          variant='outlined'
          color='inherit'
          size='medium'
          startIcon={<MdEdit />}
          disabled={isLoading}
          onClick={() => openDialog({ type: 'update', action })}
        >
          {t('common.edit')}
        </Button>
        {/* Only admins delete. */}
        {isAdmin && (
          <Button
            variant='outlined'
            color='inherit'
            size='medium'
            startIcon={<MdDelete />}
            disabled={isLoading}
            onClick={() => openDialog({ type: 'delete', action })}
          >
            {t('common.delete')}
          </Button>
        )}
      </Stack>
    </Stack>
  );
};
