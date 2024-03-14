'use client';

import { Box, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import React from 'react';
import { MdArrowBack } from 'react-icons/md';

export const CreateDonationHeader = () => {
  const router = useRouter();
  return (
    <Typography variant='h1'>
      <Stack direction='row' alignItems='center' gap={1}>
        <Box sx={{ cursor: 'pointer' }} onClick={() => router.back()}>
          <MdArrowBack size={24} />
        </Box>
        <>New Donation</>
      </Stack>
    </Typography>
  );
};
