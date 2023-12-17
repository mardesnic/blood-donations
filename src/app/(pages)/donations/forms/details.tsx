import { Grid, TextField } from '@mui/material';
import React from 'react';
import { DATE_FORMAT } from '@/lib/const';
import dayjs from 'dayjs';
import { DonationWithDonor } from '@/context/DonationsContext';

interface Props {
  donation: DonationWithDonor;
}

export const DonationDetailsForm = ({ donation }: Props) => {
  const fields: {
    label: string;
    value: string | number;
  }[] = [
    {
      label: 'Donation date',
      value: dayjs(donation.donationDate).format(DATE_FORMAT),
    },
    {
      label: 'Donor',
      value: donation?.donor?.fullName || '',
    },
    {
      label: 'Action',
      value: donation?.action?.title || '',
    },
    {
      label: 'Denied',
      value: donation.denied ? 'true' : 'false',
    },
    {
      label: 'Denied Reason',
      value: donation.denyReason || '',
    },
    {
      label: 'Note',
      value: donation.note || '',
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
