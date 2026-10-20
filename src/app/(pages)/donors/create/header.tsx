import { Stack, Typography } from '@mui/material';
import Link from 'next/link';
import React from 'react';
import { MdArrowBack } from 'react-icons/md';
import { useTranslations } from 'next-intl';

import { ROUTE_PATHS } from '@/routes';

export const CreateDonorHeader = () => {
  const t = useTranslations('donors');
  return (
    <Typography variant='h1'>
      <Stack
        direction='row'
        sx={{
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Link
          href={`${ROUTE_PATHS.PROTECTED.DONORS.path}`}
          className='tap-target'
        >
          <MdArrowBack size={24} />
        </Link>
        <>{t('new')}</>
      </Stack>
    </Typography>
  );
};
