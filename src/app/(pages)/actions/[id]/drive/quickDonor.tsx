'use client';

import React from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslations } from 'next-intl';
import { Donor } from '@/generated/prisma/browser';
import { BLOOD_TYPES, DATE_FORMAT, GENDERS } from '@/lib/const';
import { useRevalidateOnLocaleChange } from '@/hooks/useRevalidateOnLocaleChange';
import { DonorListItem } from '@/hooks/useDonors';
import {
  duplicatesBlockSaving,
  useDuplicateDonors,
} from '@/hooks/useDuplicateDonors';
import { DuplicateDonorWarning } from '@/components/DuplicateDonorWarning';

interface Props {
  open: boolean;
  // What was typed in the search, split into first and last name.
  initialName: string;
  onClose: () => void;
  // A new donor, or an existing one picked from the duplicate warning.
  onCreated: (donor: DonorListItem) => void;
}

// The few fields needed to record a new donor at a drive; the rest can be
// filled in later on the donor's page.
export const QuickDonorDialog = ({
  open,
  initialName,
  onClose,
  onCreated,
}: Props) => {
  const t = useTranslations();
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const [firstName = '', ...rest] = initialName.trim().split(/\s+/);
  const [error, setError] = React.useState('');

  const formik = useFormik({
    initialValues: {
      firstName,
      lastName: rest.join(' '),
      gender: '',
      dob: null as Dayjs | null,
      bloodType: '',
      oib: '',
      phone: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .trim()
        .required(t('validation.firstNameRequired')),
      lastName: Yup.string().trim().required(t('validation.lastNameRequired')),
      gender: Yup.string().required(t('validation.genderRequired')),
      oib: Yup.string().matches(/^\d{11}$/, {
        message: t('validation.oibDigits'),
        excludeEmptyString: true,
      }),
    }),
    onSubmit: async (values) => {
      if (duplicatesBlockSaving(matches, confirmedDifferent)) {
        return;
      }
      setError('');
      const response = await fetch('/api/donors', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          dob: values.dob?.isValid() ? values.dob.format('YYYY-MM-DD') : '',
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(
          body?.code === 'DUPLICATE_OIB'
            ? t('duplicates.oibTaken')
            : t('drive.saveError')
        );
        return;
      }
      onCreated((await response.json()) as Donor);
    },
  });
  useRevalidateOnLocaleChange(formik);

  // Someone already in the app? Then pick them instead of adding again.
  const [confirmedDifferent, setConfirmedDifferent] = React.useState(false);
  const matches = useDuplicateDonors({
    firstName: formik.values.firstName,
    lastName: formik.values.lastName,
    dob: formik.values.dob?.isValid()
      ? formik.values.dob.format('YYYY-MM-DD')
      : '',
    oib: formik.values.oib,
  });
  const blocked = duplicatesBlockSaving(matches, confirmedDifferent);

  const field = (name: 'firstName' | 'lastName' | 'oib' | 'phone') => ({
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: formik.touched[name] && Boolean(formik.errors[name]),
    helperText: formik.touched[name] && formik.errors[name],
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='sm'
      fullScreen={isPhone}
      keepMounted={false}
    >
      <DialogTitle>{t('drive.newDonor')}</DialogTitle>
      <DialogContent>
        <form onSubmit={formik.handleSubmit} noValidate>
          <Grid container columnSpacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...field('firstName')}
                label={t('fields.firstName')}
                required
                autoFocus
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...field('lastName')}
                label={t('fields.lastName')}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name='gender'
                label={t('fields.gender')}
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
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name='bloodType'
                label={t('fields.bloodType')}
                value={formik.values.bloodType}
                onChange={formik.handleChange}
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
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label={t('fields.dob')}
                value={formik.values.dob}
                onChange={(value) => formik.setFieldValue('dob', value)}
                format={DATE_FORMAT}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField {...field('oib')} label={t('fields.oib')} />
            </Grid>
            <Grid size={12}>
              <TextField {...field('phone')} label={t('fields.phone')} />
            </Grid>
          </Grid>
          <DuplicateDonorWarning
            matches={matches}
            confirmedDifferent={confirmedDifferent}
            onConfirmDifferent={setConfirmedDifferent}
            onPick={(match) => onCreated(match.donor)}
          />
          {error && <Stack sx={{ color: 'error.main', mt: 1 }}>{error}</Stack>}
          <Stack
            direction={{ xs: 'column-reverse', sm: 'row' }}
            justifyContent='flex-end'
            gap={2}
            mt={2}
          >
            <Button
              variant='outlined'
              color='secondary'
              onClick={onClose}
              disabled={formik.isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type='submit'
              color='secondary'
              disabled={formik.isSubmitting || blocked}
            >
              {t('donors.add')}
            </Button>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
};
