import { Stack, Typography } from '@mui/material';
import React, { ReactNode } from 'react';

// What a list or section shows when it has nothing in it: a short message
// and, optionally, what to do about it (e.g. a button to clear the search).
export const EmptyState = ({
  message,
  action,
}: {
  message: ReactNode;
  action?: ReactNode;
}) => (
  <Stack
    sx={{
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: 2,
      py: 5,
      px: 2,
      height: '100%',
    }}
  >
    <Typography sx={{ color: 'text.secondary' }}>{message}</Typography>
    {action}
  </Stack>
);
