'use client';

import React from 'react';
import Link from 'next/link';
import { Breadcrumbs, Button, Stack, Typography } from '@mui/material';
import { MdDelete, MdEdit } from 'react-icons/md';
import { useTranslations } from 'next-intl';
import { ROUTE_PATHS } from '@/routes';
import { usePlacesContext } from '@/context/PlacesContext';
import type { PlaceWithActionCount } from '@/app/api/places/service';

interface Props {
  place: PlaceWithActionCount;
}

// Breadcrumbs plus Edit and Delete, which open the places dialogs.
export const PlaceDetailsHeader = ({ place }: Props) => {
  const t = useTranslations();
  const { openDialog, isLoading } = usePlacesContext();
  return (
    <Stack
      direction='row'
      justifyContent='space-between'
      alignItems='center'
      flexWrap='wrap'
      gap={2}
      mb={3}
    >
      <Breadcrumbs>
        <Link href={ROUTE_PATHS.PROTECTED.PLACES.path} className='tap-target'>
          {t('nav.places')}
        </Link>
        {/* Breadcrumbs grey the last item; the title stays prominent. */}
        <Typography
          variant='h1'
          component='h1'
          color='text.primary'
          sx={{ mb: 0 }}
        >
          {place.title}
        </Typography>
      </Breadcrumbs>
      <Stack direction='row' gap={2}>
        <Button
          variant='outlined'
          color='inherit'
          size='medium'
          startIcon={<MdEdit />}
          disabled={isLoading}
          onClick={() => openDialog({ type: 'update', place })}
        >
          {t('common.edit')}
        </Button>
        <Button
          variant='outlined'
          color='inherit'
          size='medium'
          startIcon={<MdDelete />}
          disabled={isLoading}
          onClick={() =>
            openDialog({
              type: 'delete',
              place,
              actionCount: place._count.actions,
            })
          }
        >
          {t('common.delete')}
        </Button>
      </Stack>
    </Stack>
  );
};
