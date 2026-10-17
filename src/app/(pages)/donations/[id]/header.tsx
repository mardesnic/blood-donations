'use client';

import { DonationWithDonor } from '@/context/DonationsContext';
import { Box, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import React from 'react';
import { MdArrowBack } from 'react-icons/md';
import { useTranslations } from 'next-intl';
interface Props {
  donation: DonationWithDonor;
}

export const UpdateDonationHeader = ({ donation }: Props) => {
  const router = useRouter();
  const t = useTranslations('pageTitles');
  return (
    <Typography variant='h1'>
      <Stack direction='row' alignItems='center' gap={1}>
        <Box sx={{ cursor: 'pointer' }} onClick={() => router.back()}>
          <MdArrowBack size={24} />
        </Box>
        <>{t('donation', { name: donation?.donor?.fullName || '' })}</>
      </Stack>
    </Typography>
  );
};
