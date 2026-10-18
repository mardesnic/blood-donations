'use client';

import React from 'react';
import * as Yup from 'yup';
import {
  useDonationsContext,
  DonationWithDonor,
} from '@/context/DonationsContext';
import { useGetActions } from '@/hooks/useActions';
import { Box, Button, MenuItem, Stack } from '@mui/material';
import { Donation, Donor, DenyReasonType } from '@/generated/prisma/browser';
import { useFormik } from 'formik';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { debounce } from '@mui/material/utils';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import dayjs from 'dayjs';
import { DATE_TIME_FORMAT, MAX_PAGE_SIZE } from '@/lib/const';
import { useGetDonors } from '@/hooks/useDonors';
import { ROUTE_PATHS } from '@/routes';
import { useRouter } from 'next/navigation';
import { useGoBack } from '@/hooks/useGoBack';
import { useTranslations } from 'next-intl';
import { useRevalidateOnLocaleChange } from '@/hooks/useRevalidateOnLocaleChange';

interface Props {
  donation?: DonationWithDonor;
}

const Form = ({ donation }: Props) => {
  const router = useRouter();
  const t = useTranslations();
  const goBack = useGoBack(ROUTE_PATHS.PROTECTED.DONATIONS.path);
  const {
    createDonation,
    updateDonation,
    isLoading,
    donor,
    action,
    openDialog,
  } = useDonationsContext();

  // Starts with the donation's (or the preselected) donor, so it is among
  // the options.
  const [searchQuery, setSearchQuery] = React.useState(
    donation?.donor?.fullName || donor?.fullName || ''
  );

  const { isLoading: isDonorsLoading, data } = useGetDonors({
    page: 0,
    pageSize: 20,
    search: searchQuery,
  });

  // Up to MAX_PAGE_SIZE most recent actions, plus the donation's own (or the
  // preselected) action if it is older than those.
  const { data: actionsData } = useGetActions({
    page: 0,
    pageSize: MAX_PAGE_SIZE,
    sort: 'startDateTime|desc',
  });
  const actions = React.useMemo(() => {
    const list = actionsData?.actions || [];
    const current = donation?.action ?? action;
    return current && !list.some((a) => a.id === current.id)
      ? [current, ...list]
      : list;
  }, [actionsData, donation, action]);

  const deniedReasons = Object.keys(DenyReasonType);
  const formik = useFormik({
    initialValues: {
      donorId: donation?.donorId || donor?.id || '',
      donor: donation?.donor || donor || null,
      actionId: donation?.actionId || action?.id || '',
      // New donations default to "now", set in the browser after hydration:
      // this page is prerendered, so a server-side "now" would be the build
      // time and wouldn't match what the browser renders.
      donationDate: donation ? dayjs(donation.donationDate) : null,
      denied: !!donation?.denied,
      denyReason: donation?.denyReason || '',
      note: donation?.note || '',
    },
    validationSchema: Yup.object({
      donor: Yup.object().shape({
        id: Yup.string()
          .required(t('validation.donorRequired'))
          .min(1, t('validation.selectDonor')),
      }),
    }),
    onSubmit: async (values) => {
      const newValues = {
        donorId: values.donorId,
        actionId: values.actionId || '',
        denied: values.denied,
        note: values.note,
        denyReason: values.denyReason || null,
        donationDate: (values.donationDate ?? dayjs()).toDate(),
      } as Donation;
      if (donation?.id) {
        await updateDonation({
          ...newValues,
          id: donation.id,
        });
      } else {
        await createDonation(newValues as Donation);
      }
      goBack();
    },
  });
  useRevalidateOnLocaleChange(formik);

  const onDonorInputChange = (_: React.SyntheticEvent, value: string) => {
    setSearchQuery(value);
  };

  const searchDonorDelayed = React.useMemo(
    () => debounce(onDonorInputChange, 500),
    []
  );

  React.useEffect(() => {
    if (!donation) {
      formik.setFieldValue('donationDate', dayjs());
    }
    (() => formik.validateForm())();
  }, []);

  return (
    <Box component='form' onSubmit={formik.handleSubmit} noValidate>
      <Autocomplete
        disablePortal
        fullWidth
        id='donors-selector'
        options={data?.donors || []}
        value={formik.values.donor}
        onChange={(event, value) => {
          formik.setFieldValue('donorId', value?.id);
          formik.setFieldValue('donor', value);
        }}
        onBlur={formik.handleBlur}
        onInputChange={searchDonorDelayed}
        getOptionKey={(option: Donor) => option.id}
        getOptionLabel={(option) => option.fullName || ''}
        isOptionEqualToValue={(option, value) => option.id === value?.id}
        loading={isDonorsLoading}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t('fields.donor')}
            onBlur={formik.handleBlur}
            error={formik.touched.donorId && Boolean(formik.errors.donorId)}
            helperText={formik.touched.donorId && formik.errors.donorId}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {isDonorsLoading ? (
                    <CircularProgress color='inherit' size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
          />
        )}
      />

      <TextField
        label={t('fields.action')}
        name='actionId'
        value={formik.values.actionId}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.actionId && Boolean(formik.errors.actionId)}
        helperText={formik.touched.actionId && formik.errors.actionId}
        select
      >
        <MenuItem value=''>
          <em>{t('common.none')}</em>
        </MenuItem>
        {actions.map((action) => (
          <MenuItem key={action.id} value={action.id}>
            {action.title}
          </MenuItem>
        ))}
      </TextField>
      <DateTimePicker
        label={t('fields.donationDate')}
        value={formik.values.donationDate}
        onChange={(value) => formik.setFieldValue('donationDate', dayjs(value))}
        format={DATE_TIME_FORMAT}
        ampm={false}
      />
      <TextField
        label={t('fields.note')}
        name='note'
        value={formik.values.note}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />

      <FormControlLabel
        control={
          <Checkbox
            name='denied'
            checked={formik.values.denied}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        }
        label={t('fields.denied')}
      />

      {formik.values.denied && (
        <TextField
          label={t('fields.deniedReason')}
          name='denyReason'
          value={formik.values.denyReason}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.denyReason && Boolean(formik.errors.denyReason)}
          helperText={formik.touched.denyReason && formik.errors.denyReason}
          select
        >
          {deniedReasons.map((reason) => (
            <MenuItem key={reason} value={reason}>
              {t(`denyReasons.${reason}`)}
            </MenuItem>
          ))}
        </TextField>
      )}
      {/* Phones stack the buttons full width: Save on top, Delete last. */}
      <Stack
        direction={{ xs: 'column-reverse', sm: 'row' }}
        justifyContent='space-between'
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={2}
        mt={3}
      >
        {!!donation && (
          <Button
            onClick={() => openDialog({ type: 'delete', donation })}
            variant='outlined'
            disabled={isLoading}
          >
            {t('donations.delete')}
          </Button>
        )}
        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          justifyContent='flex-end'
          gap={2}
          ml={{ sm: 'auto' }}
        >
          <Button
            onClick={() => router.back()}
            variant='outlined'
            disabled={isLoading}
            color='secondary'
          >
            {t('common.cancel')}
          </Button>
          <Button
            type='submit'
            disabled={isLoading || formik.isSubmitting || !formik.isValid}
            color='secondary'
            size='medium'
          >
            {t('common.saveChanges')}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export const DonationCreateUpdateForm = ({ donation }: Props) => {
  return <Form donation={donation} />;
};
