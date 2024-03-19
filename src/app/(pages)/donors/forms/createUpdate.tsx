'use client';
import { useDonorsContext } from '@/context/DonorsContext';
import { Box, Button, MenuItem, Stack, TextField } from '@mui/material';
import { Donor } from '@prisma/client';
import { useFormik } from 'formik';
import dayjs from 'dayjs';
import React from 'react';
import * as Yup from 'yup';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DATE_FORMAT, GENDERS, BLOOD_TYPES } from '@/lib/const';
import { DatePicker } from '@mui/x-date-pickers';
import { useRouter } from 'next/navigation';
import { ROUTE_PATHS } from '@/routes';

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
      fullName: `${donor?.firstName || ''} ${donor?.lastName || ''}`,
      fatherName: donor?.fatherName || '',
      email: donor?.email || '',
      phone: donor?.phone || '',
      dob: dayjs(donor?.dob) || dayjs(),
      oib: donor?.oib || '',
      address: donor?.address || '',
      city: donor?.city || '',
      gender: donor?.gender || '',
      bloodType: donor?.bloodType || '',
      donationCount: donor?.donationCount || 0,
      lastDonation: dayjs(donor?.lastDonation) || dayjs(),
      active: donor?.active || true,
    },
    validationSchema: Yup.object({
      fullName: Yup.string()
        .required('Full Name is required')
        .min(2, 'Must be 2 characters or more'),
      oib: Yup.string()
        .required('OIB is required')
        .min(11, 'Must be exactly 11 digits')
        .max(11, 'Must be exactly 11 digits'),
      gender: Yup.string().required('Gender is required'),
      bloodType: Yup.string().required('Blood type is required'),
      email: Yup.string().email('Email must be a valid email'),
      donationCount: Yup.number().min(
        0,
        'Donation count must greater than or equal to 0'
      ),
    }),
    onSubmit: async (values) => {
      const names: string[] = values.fullName.split(' ');
      const newValues = {
        ...values,
        firstName: names[0] || '',
        lastName: names[1] || '',
        dob: values.dob.toDate(),
        lastDonation: values.lastDonation.toDate(),
      };
      if (donor?.id) {
        await updateDonor({
          ...newValues,
          id: donor.id,
        } as Donor);
      } else {
        await createDonor(newValues as Donor);
      }

      goToDonorsTable();
    },
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component='form' onSubmit={formik.handleSubmit} noValidate>
        <TextField
          label='Full Name'
          name='fullName'
          value={formik.values.fullName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.fullName && Boolean(formik.errors.fullName)}
          helperText={formik.touched.fullName && formik.errors.fullName}
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
          error={formik.touched.bloodType && Boolean(formik.errors.bloodType)}
          helperText={formik.touched.bloodType && formik.errors.bloodType}
          select
          required
        >
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
          required
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
          onChange={(value) => formik.setFieldValue('dob', dayjs(value))}
          format={DATE_FORMAT}
        />

        <DatePicker
          label='Last donation date'
          value={formik.values.lastDonation}
          onChange={(value) =>
            formik.setFieldValue('lastDonation', dayjs(value))
          }
          format={DATE_FORMAT}
        />

        <TextField
          label='Donation count'
          name='donationCount'
          value={formik.values.donationCount}
          onChange={formik.handleChange}
          type='number'
          InputLabelProps={{ shrink: true }}
          onBlur={formik.handleBlur}
          error={
            formik.touched.donationCount && Boolean(formik.errors.donationCount)
          }
          helperText={
            formik.touched.donationCount && formik.errors.donationCount
          }
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
