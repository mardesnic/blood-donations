import { Grid, TextField } from '@mui/material';
import React from 'react';
import { DATE_FORMAT } from '@/lib/const';
import { Donor } from '@prisma/client';
import dayjs from 'dayjs';

interface Props {
  donor: Donor;
}

export const DonorDetailsForm = ({ donor }: Props) => {
  const fields: {
    label: string;
    value: string | number;
  }[] = [
    {
      label: 'First Name',
      value: donor.firstName,
    },
    {
      label: 'Last Name',
      value: donor.lastName,
    },
    {
      label: 'Father Name',
      value: donor.fatherName || '',
    },
    {
      label: 'Gender',
      value: donor.gender,
    },
    {
      label: 'Blood Type',
      value: donor.bloodType,
    },
    {
      label: 'OIB',
      value: donor.oib,
    },
    {
      label: 'Date of Birth',
      value: dayjs(donor.dob).format(DATE_FORMAT),
    },
    {
      label: 'City',
      value: donor.city || '',
    },
    {
      label: 'Address',
      value: donor.address || '',
    },
    {
      label: 'Phone',
      value: donor.phone || '',
    },
    {
      label: 'Email',
      value: donor.email,
    },
    {
      label: 'Last donation date',
      value: dayjs(donor.lastDonation).format(DATE_FORMAT),
    },
    {
      label: 'Donation count',
      value: donor.donationCount,
    },
    {
      label: 'Note',
      value: donor.note || '',
    },
  ];
  return (
    <Grid container spacing={2}>
      {fields.map((field) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={field.label}>
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
