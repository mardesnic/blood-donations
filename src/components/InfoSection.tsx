import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import React, { ReactNode } from 'react';

// A label and its value on an overview page; empty values show a dash.
export const InfoField = ({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) => (
  <Box>
    <Typography variant='body2' color='text.secondary'>
      {label}
    </Typography>
    <Typography component='div' sx={{ wordBreak: 'break-word' }}>
      {value || value === 0 ? value : '—'}
    </Typography>
  </Box>
);

// A titled card of InfoFields.
export const InfoSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <Card elevation={2} sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant='h3' component='h2' sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Stack gap={1.5}>{children}</Stack>
    </CardContent>
  </Card>
);
