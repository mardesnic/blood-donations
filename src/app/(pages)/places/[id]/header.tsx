import { ROUTE_PATHS } from '@/routes';
import { Breadcrumbs, Typography } from '@mui/material';
import Link from 'next/link';

import { Place } from '@prisma/client';
import React from 'react';

interface Props {
  place: Place;
}

export const PlaceDetailsHeader = ({ place }: Props) => {
  return (
    <Breadcrumbs sx={{ mb: 4 }}>
      <Link href={ROUTE_PATHS.PROTECTED.PLACES.path}>Places</Link>
      <Typography>{place.title}</Typography>
    </Breadcrumbs>
  );
};
