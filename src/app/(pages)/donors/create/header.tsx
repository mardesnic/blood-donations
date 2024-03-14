import { Stack, Typography } from '@mui/material';
import Link from 'next/link';
import React from 'react';
import { MdArrowBack } from 'react-icons/md';

import { ROUTE_PATHS } from '@/routes';

export const CreateDonorHeader = () => {
  return (
    <Typography variant='h1'>
      <Stack direction='row' alignItems='center' gap={1}>
        <Link href={`${ROUTE_PATHS.PROTECTED.DONORS.path}`}>
          <MdArrowBack size={24} />
        </Link>
        <>New Donor</>
      </Stack>
    </Typography>
  );
};
