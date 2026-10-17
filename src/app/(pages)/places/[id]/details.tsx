'use client';

import {
  Breadcrumbs,
  Button,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import React from 'react';
import { MdDelete, MdEdit } from 'react-icons/md';
import { useTranslations } from 'next-intl';
import { usePlacesContext } from '@/context/PlacesContext';
import type { PlaceWithActionCount } from '@/app/api/places/service';
import { ROUTE_PATHS } from '@/routes';

interface Props {
  place: PlaceWithActionCount;
}

const FIELDS = [
  'title',
  'city',
  'address',
  'contactName',
  'phone',
  'email',
  'note',
] as const;

export const PlaceDetails = ({ place }: Props) => {
  const t = useTranslations();
  const { openDialog, isLoading } = usePlacesContext();
  return (
    <>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        mb={4}
        gap={2}
      >
        <Breadcrumbs>
          <Link href={ROUTE_PATHS.PROTECTED.PLACES.path}>
            {t('nav.places')}
          </Link>
          <Typography>{place.title}</Typography>
        </Breadcrumbs>
        <Stack direction='row' gap={2}>
          <Button
            variant='outlined'
            startIcon={<MdEdit />}
            disabled={isLoading}
            onClick={() => openDialog({ type: 'update', place })}
          >
            {t('common.edit')}
          </Button>
          <Button
            variant='outlined'
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
      <Grid container spacing={2}>
        {FIELDS.map((field) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={field}>
            <TextField
              label={t(`fields.${field}`)}
              value={place[field] || ''}
              InputProps={{ readOnly: true }}
              margin='none'
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
};
