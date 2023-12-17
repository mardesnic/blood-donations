import { Grid, TextField } from '@mui/material';
import React from 'react';
import { Place } from '@prisma/client';

interface Props {
  place: Place;
}

export const PlaceDetailsForm = ({ place }: Props) => {
  const fields: {
    label: string;
    value: string | number;
  }[] = [
    {
      label: 'Title',
      value: place.title,
    },
    {
      label: 'City',
      value: place.city || '',
    },
    {
      label: 'Address',
      value: place.address || '',
    },
    {
      label: 'Contact',
      value: place.contactName || '',
    },
    {
      label: 'Phone',
      value: place.email || '',
    },
  ];
  return (
    <Grid container spacing={2}>
      {fields.map((field) => (
        <Grid item xs={12} sm={6} md={4} key={field.label}>
          <TextField
            label={field.label}
            value={field.value}
            InputProps={{
              readOnly: true,
            }}
            margin={'none'}
          />
        </Grid>
      ))}
    </Grid>
  );
};
