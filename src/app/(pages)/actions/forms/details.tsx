import { Grid, TextField } from '@mui/material';
import React from 'react';
import { DATE_FORMAT } from '@/lib/const';
import dayjs from 'dayjs';
import { ActionWithPlace } from '@/context/ActionsContext';

interface Props {
  action: ActionWithPlace;
}

export const ActionDetailsForm = ({ action }: Props) => {
  const fields: {
    label: string;
    value: string | number;
  }[] = [
    {
      label: 'Title',
      value: action.title,
    },
    {
      label: 'Place',
      value: action?.place?.title || '',
    },
    {
      label: 'Start time',
      value: dayjs(action.startDateTime).format(DATE_FORMAT),
    },
    {
      label: 'End time',
      value: dayjs(action.endDateTime).format(DATE_FORMAT),
    },
    {
      label: 'Note',
      value: action.note || '',
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
