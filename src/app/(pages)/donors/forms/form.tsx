import { useDonorsContext } from '@/context/DonorsContext';
import { Box, Button, MenuItem, Stack, TextField } from '@mui/material';
import { BloodType, Donor, Gender } from '@prisma/client';
import { useFormik } from 'formik';
import dayjs from 'dayjs';
import React from 'react';
import { MdEdit } from 'react-icons/md';
import * as Yup from 'yup';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DATE_FORMAT } from '@/lib/const';
import { DatePicker } from '@mui/x-date-pickers';

interface Props {
  donor?: Donor;
}

export const DonorForm = ({ donor }: Props) => {
  const { closeDialog, createDonor, updateDonor, isLoading } =
    useDonorsContext();

  const formik = useFormik({
    initialValues: {
      firstName: donor?.firstName || '',
      lastName: donor?.lastName || '',
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
      note: donor?.note || '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .required('First Name is required')
        .min(2, 'Must be 2 characters or more'),
      lastName: Yup.string()
        .required('Last Name is required')
        .min(2, 'Must be 2 characters or more'),
      oib: Yup.string()
        .required('OIB is required')
        .min(11, 'Must be exactly 11 digits')
        .max(11, 'Must be exactly 11 digits'),
      gender: Yup.string().required('Gender is required'),
      bloodType: Yup.string().required('Blood type is required'),
      email: Yup.string()
        .required('Email is required')
        .email('Email must be a valid email'),
      donationCount: Yup.number().min(
        0,
        'Donation count must greater than or equal to 0'
      ),
    }),
    onSubmit: async (values) => {
      const newValues = {
        ...values,
        dob: values.dob.toDate(),
        lastDonation: values.lastDonation.toDate(),
      };
      try {
        if (donor?.id) {
          await updateDonor({
            ...newValues,
            id: donor.id,
          } as Donor);
        } else {
          await createDonor(newValues as Donor);
        }
        closeDialog();
      } catch (error) {
        console.log(error);
      }
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
          {Object.values(Gender).map((gender) => (
            <MenuItem key={gender} value={gender}>
              {gender}
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
          {Object.values(BloodType).map((bloodType) => (
            <MenuItem key={bloodType} value={bloodType}>
              {bloodType}
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

        <DatePicker
          label='Date of Birth'
          value={formik.values.dob}
          onChange={(value) => formik.setFieldValue('dob', dayjs(value))}
          format={DATE_FORMAT}
        />

        <TextField
          label='City'
          name='city'
          value={formik.values.city}
          onChange={formik.handleChange}
        />

        <TextField
          label='Address'
          name='address'
          value={formik.values.address}
          onChange={formik.handleChange}
        />

        <TextField
          label='Phone'
          name='phone'
          value={formik.values.phone}
          onChange={formik.handleChange}
        />

        <TextField
          label='Email'
          name='email'
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          required
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

        <TextField
          label='Note'
          name='note'
          value={formik.values.note}
          onChange={formik.handleChange}
          multiline
        />

        <Stack direction='row' justifyContent='flex-end' gap={2}>
          <Button onClick={closeDialog} variant='outlined' disabled={isLoading}>
            Cancel
          </Button>
          <Button type='submit' disabled={isLoading} startIcon={<MdEdit />}>
            Save Changes
          </Button>
        </Stack>
      </Box>
    </LocalizationProvider>
  );
};
