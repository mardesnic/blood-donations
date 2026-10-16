'use client';
import { useDonorsContext } from '@/context/DonorsContext';
import {
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { Donor } from '@prisma/client';
import { useFormik } from 'formik';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';
import * as Yup from 'yup';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DATE_FORMAT, GENDERS, BLOOD_TYPES } from '@/lib/const';
import { DatePicker } from '@mui/x-date-pickers';
import { useRouter } from 'next/navigation';
import { ROUTE_PATHS } from '@/routes';
import { toDayString } from '@/lib/dates';

// Stored calendar dates (UTC midnight) as a local day for the date pickers.
const toDayjs = (value: Date | null | undefined): Dayjs | null =>
  value ? dayjs(toDayString(value)) : null;

interface Props {
  donor?: Donor;
}

export const DonorCreateUpdateForm = ({ donor }: Props) => {
  const router = useRouter();

  const goToDonorsTable = () => {
    router.push(`${ROUTE_PATHS.PROTECTED.DONORS.path}`);
  };

  const { createDonor, updateDonor, isLoading, openDialog } =
    useDonorsContext();

  const formik = useFormik({
    initialValues: {
      firstName: donor?.firstName || '',
      lastName: donor?.lastName || '',
      fatherName: donor?.fatherName || '',
      email: donor?.email || '',
      phone: donor?.phone || '',
      dob: toDayjs(donor?.dob),
      oib: donor?.oib || '',
      address: donor?.address || '',
      city: donor?.city || '',
      gender: donor?.gender || '',
      bloodType: donor?.bloodType || '',
      initialDonationCount: donor?.initialDonationCount ?? 0,
      initialLastDonation: toDayjs(donor?.initialLastDonation),
      active: donor?.active ?? true,
    },
    validationSchema: Yup.object({
      firstName: Yup.string().trim().required('First name is required'),
      lastName: Yup.string().trim().required('Last name is required'),
      oib: Yup.string().matches(/^\d{11}$/, {
        message: 'Must be exactly 11 digits',
        excludeEmptyString: true,
      }),
      gender: Yup.string().required('Gender is required'),
      email: Yup.string().email('Email must be a valid email'),
      initialDonationCount: Yup.number()
        .integer('Must be a whole number')
        .min(0, 'Donation count must greater than or equal to 0'),
    }),
    onSubmit: async (values) => {
      const newValues = {
        ...values,
        // Calendar days are sent as YYYY-MM-DD so no time zone can shift them.
        dob: values.dob?.isValid() ? values.dob.format('YYYY-MM-DD') : '',
        initialLastDonation: values.initialLastDonation?.isValid()
          ? values.initialLastDonation.format('YYYY-MM-DD')
          : '',
      };
      if (donor?.id) {
        await updateDonor({
          ...newValues,
          id: donor.id,
        } as unknown as Donor);
      } else {
        await createDonor(newValues as unknown as Donor);
      }

      goToDonorsTable();
    },
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component='form' onSubmit={formik.handleSubmit} noValidate>
        <TextField
          label='First Name'
          name='firstName'
          value={formik.values.firstName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.firstName && Boolean(formik.errors.firstName)}
          helperText={formik.touched.firstName && formik.errors.firstName}
          required
        />

        <TextField
          label='Last Name'
          name='lastName'
          value={formik.values.lastName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.lastName && Boolean(formik.errors.lastName)}
          helperText={formik.touched.lastName && formik.errors.lastName}
          required
        />

        <TextField
          label='Email'
          name='email'
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />

        <TextField
          label='Father Name'
          name='fatherName'
          value={formik.values.fatherName}
          onChange={formik.handleChange}
        />

        <TextField
          label='Gender'
          name='gender'
          value={formik.values.gender}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.gender && Boolean(formik.errors.gender)}
          helperText={formik.touched.gender && formik.errors.gender}
          select
          required
        >
          {Object.keys(GENDERS).map((gender) => (
            <MenuItem key={gender} value={gender}>
              {GENDERS[gender].full}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label='Blood Type'
          name='bloodType'
          value={formik.values.bloodType}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          select
        >
          <MenuItem value=''>
            <em>Unknown</em>
          </MenuItem>
          {Object.keys(BLOOD_TYPES).map((bloodType) => (
            <MenuItem key={bloodType} value={bloodType}>
              {BLOOD_TYPES[bloodType]}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label='OIB'
          name='oib'
          value={formik.values.oib}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.oib && Boolean(formik.errors.oib)}
          helperText={formik.touched.oib && formik.errors.oib}
        />

        <TextField
          label='Phone'
          name='phone'
          value={formik.values.phone}
          onChange={formik.handleChange}
        />

        <TextField
          label='Address'
          name='address'
          value={formik.values.address}
          onChange={formik.handleChange}
        />

        <TextField
          label='City'
          name='city'
          value={formik.values.city}
          onChange={formik.handleChange}
        />

        <DatePicker
          label='Date of Birth'
          value={formik.values.dob}
          onChange={(value) => formik.setFieldValue('dob', value)}
          format={DATE_FORMAT}
          slotProps={{ actionBar: { actions: ['clear'] } }}
        />

        <TextField
          label='Donations before records'
          name='initialDonationCount'
          value={formik.values.initialDonationCount}
          onChange={formik.handleChange}
          type='number'
          InputLabelProps={{ shrink: true }}
          onBlur={formik.handleBlur}
          error={
            formik.touched.initialDonationCount &&
            Boolean(formik.errors.initialDonationCount)
          }
          helperText={
            (formik.touched.initialDonationCount &&
              formik.errors.initialDonationCount) ||
            (donor
              ? `Total with recorded donations: ${donor.donationCount}`
              : 'Donations made before they were recorded in this app')
          }
        />

        <DatePicker
          label='Last donation before records'
          value={formik.values.initialLastDonation}
          onChange={(value) =>
            formik.setFieldValue('initialLastDonation', value)
          }
          format={DATE_FORMAT}
          slotProps={{ actionBar: { actions: ['clear'] } }}
        />

        <FormControlLabel
          control={
            <Switch
              name='active'
              checked={formik.values.active}
              onChange={formik.handleChange}
            />
          }
          label='Active'
        />

        <Stack direction='row' justifyContent='space-between'>
          <Stack>
            {donor?.id && (
              <Button
                onClick={() => openDialog({ type: 'delete', donor })}
                variant='outlined'
                disabled={isLoading}
              >
                Delete Account
              </Button>
            )}
          </Stack>

          <Stack direction='row' gap={2}>
            <Button
              onClick={goToDonorsTable}
              variant='outlined'
              color='secondary'
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isLoading}
              color='secondary'
              size='medium'
            >
              {donor?.id ? 'Save Changes' : 'Add Donor'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </LocalizationProvider>
  );
};
