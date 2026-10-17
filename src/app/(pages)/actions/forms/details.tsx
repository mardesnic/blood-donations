import { Grid, TextField } from '@mui/material';
import React from 'react';
import { DATE_FORMAT } from '@/lib/const';
import dayjs from 'dayjs';
import { ActionWithPlace } from '@/context/ActionsContext';
import { useTranslations } from 'next-intl';

interface Props {
  action: ActionWithPlace;
}

export const ActionDetailsForm = ({ action }: Props) => {
  const t = useTranslations('fields');
  const fields: {
    label: string;
    value: string | number;
  }[] = [
    {
      label: t('title'),
      value: action.title,
    },
    {
      label: t('place'),
      value: action?.place?.title || '',
    },
    {
      label: t('startTime'),
      value: dayjs(action.startDateTime).format(DATE_FORMAT),
    },
    {
      label: t('endTime'),
      value: dayjs(action.endDateTime).format(DATE_FORMAT),
    },
    {
      label: t('note'),
      value: action.note || '',
    },
  ];
  return (
    <Grid container spacing={2}>
      {fields.map((field) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={field.label}>
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
