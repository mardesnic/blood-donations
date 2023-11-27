'use client';

import { ROUTE_PATHS } from '@/routes';
import { Box, Button, Stack } from '@mui/material';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const LogoutForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    try {
      await signOut({ redirect: false });
      router.push(ROUTE_PATHS.PUBLIC.LOGIN.path);
      return;
    } catch (error) {
      console.warn(error);
      setLoading(false);
      return;
    }
  };

  return (
    <Box component='form' onSubmit={onSubmit} noValidate>
      <Stack direction='row' gap={2}>
        <Button onClick={() => router.back()} variant='outlined'>
          Cancel
        </Button>
        <Button type='submit' disabled={loading}>
          Sign Out
        </Button>
      </Stack>
    </Box>
  );
};
