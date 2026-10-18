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
import { Donor } from '@/generated/prisma/browser';
import { useFormik } from 'formik';
import dayjs, { Dayjs } from 'dayjs';
import React from 'react';
import * as Yup from 'yup';
import { DATE_FORMAT, GENDERS, BLOOD_TYPES } from '@/lib/const';
import { DatePicker } from '@mui/x-date-pickers';
import { useRouter } from 'next/navigation';
import { ROUTE_PATHS } from '@/routes';
import { toDayString } from '@/lib/dates';
import { useTranslations } from 'next-intl';
import { useRevalidateOnLocaleChange } from '@/hooks/useRevalidateOnLocaleChange';

// Stored calendar dates (UTC midnight) as a local day for the date pickers.
const toDayjs = (value: Date | null | undefined): Dayjs | null =>
  value ? dayjs(toDayString(value)) : null;

interface Props {
  donor?: Donor;
}

export const DonorCreateUpdateForm = ({ donor }: Props) => {
  const router = useRouter();
  const t = useTranslations();

  // An edited donor goes back to its overview, a new one to the list.
  const goToDonorsTable = () => {
    router.push(
      donor?.id
        ? `${ROUTE_PATHS.PROTECTED.DONORS.path}/${donor.id}`
        : ROUTE_PATHS.PROTECTED.DONORS.path
    );
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
      firstName: Yup.string()
        .trim()
        .required(t('validation.firstNameRequired')),
      lastName: Yup.string().trim().required(t('validation.lastNameRequired')),
      oib: Yup.string().matches(/^\d{11}$/, {
        message: t('validation.oibDigits'),
        excludeEmptyString: true,
      }),
      gender: Yup.string().required(t('validation.genderRequired')),
      email: Yup.string().email(t('validation.emailInvalid')),
      initialDonationCount: Yup.number()
        .integer(t('validation.wholeNumber'))
        .min(0, t('validation.donationCountMin')),
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
  useRevalidateOnLocaleChange(formik);

  return (
    <Box component='form' onSubmit={formik.handleSubmit} noValidate>
      <TextField
        label={t('fields.firstName')}
        name='firstName'
        value={formik.values.firstName}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.firstName && Boolean(formik.errors.firstName)}
        helperText={formik.touched.firstName && formik.errors.firstName}
        required
      />

      <TextField
        label={t('fields.lastName')}
        name='lastName'
        value={formik.values.lastName}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.lastName && Boolean(formik.errors.lastName)}
        helperText={formik.touched.lastName && formik.errors.lastName}
        required
      />

      <TextField
        label={t('fields.email')}
        name='email'
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
      />

      <TextField
        label={t('fields.fatherName')}
        name='fatherName'
        value={formik.values.fatherName}
        onChange={formik.handleChange}
      />

      <TextField
        label={t('fields.gender')}
        name='gender'
        value={formik.values.gender}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.gender && Boolean(formik.errors.gender)}
        helperText={formik.touched.gender && formik.errors.gender}
        select
        required
      >
        {GENDERS.map((gender) => (
          <MenuItem key={gender} value={gender}>
            {t(`genders.${gender}`)}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label={t('fields.bloodType')}
        name='bloodType'
        value={formik.values.bloodType}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        select
      >
        <MenuItem value=''>
          <em>{t('common.unknown')}</em>
        </MenuItem>
        {Object.keys(BLOOD_TYPES).map((bloodType) => (
          <MenuItem key={bloodType} value={bloodType}>
            {BLOOD_TYPES[bloodType]}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label={t('fields.oib')}
        name='oib'
        value={formik.values.oib}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.oib && Boolean(formik.errors.oib)}
        helperText={formik.touched.oib && formik.errors.oib}
      />

      <TextField
        label={t('fields.phone')}
        name='phone'
        value={formik.values.phone}
        onChange={formik.handleChange}
      />

      <TextField
        label={t('fields.address')}
        name='address'
        value={formik.values.address}
        onChange={formik.handleChange}
      />

      <TextField
        label={t('fields.city')}
        name='city'
        value={formik.values.city}
        onChange={formik.handleChange}
      />

      <DatePicker
        label={t('fields.dob')}
        value={formik.values.dob}
        onChange={(value) => formik.setFieldValue('dob', value)}
        format={DATE_FORMAT}
        slotProps={{ actionBar: { actions: ['clear'] } }}
      />

      <TextField
        label={t('fields.initialDonationCount')}
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
            ? t('donors.totalWithRecorded', { count: donor.donationCount })
            : t('donors.initialDonationsHelp'))
        }
      />

      <DatePicker
        label={t('fields.initialLastDonation')}
        value={formik.values.initialLastDonation}
        onChange={(value) => formik.setFieldValue('initialLastDonation', value)}
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
        label={t('fields.active')}
      />

      {/* Phones stack the buttons full width: Save on top, Delete last. */}
      <Stack
        direction={{ xs: 'column-reverse', sm: 'row' }}
        justifyContent='space-between'
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={2}
        mt={2}
      >
        {donor?.id && (
          <Button
            onClick={() => openDialog({ type: 'delete', donor })}
            variant='outlined'
            disabled={isLoading}
          >
            {t('donors.deleteAccount')}
          </Button>
        )}

        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          gap={2}
          ml={{ sm: 'auto' }}
        >
          <Button
            onClick={goToDonorsTable}
            variant='outlined'
            color='secondary'
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type='submit'
            disabled={isLoading}
            color='secondary'
            size='medium'
          >
            {donor?.id ? t('common.saveChanges') : t('donors.add')}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
