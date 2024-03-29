'use client';

import React from 'react';
import * as Yup from 'yup';
import {
  useDonationsContext,
  DonationWithDonor,
} from '@/context/DonationsContext';
import { useActionsContext, ActionsProvider } from '@/context/ActionsContext';
import { Box, Button, MenuItem, Stack } from '@mui/material';
import { Donation, Donor, DenyReasonType } from '@prisma/client';
import { useFormik } from 'formik';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { debounce } from '@mui/material/utils';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import dayjs from 'dayjs';
import { DATE_TIME_FORMAT } from '@/lib/const';
import { useGetDonors } from '@/hooks/useDonors';
import { ROUTE_PATHS } from '@/routes';
import { useRouter } from 'next/navigation';
import { getDenyReasonDescription } from '@/lib/utils';

interface Props {
  donation?: DonationWithDonor;
}

const Form = ({ donation }: Props) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState(
    donation?.donor?.fullName || ''
  );

  const {
    createDonation,
    updateDonation,
    isLoading,
    donor,
    action,
    openDialog,
  } = useDonationsContext();

  const { isLoading: isDonorsLoading, data } = useGetDonors({
    page: 0,
    pageSize: 20,
    search: searchQuery,
  });

  const { actions } = useActionsContext();

  const deniedReasons = Object.keys(DenyReasonType);
  const formik = useFormik({
    initialValues: {
      donorId: donation?.donorId || donor?.id || '',
      donor: donation?.donor || donor || null,
      actionId: donation?.actionId || action?.id || '',
      donationDate: dayjs(donation?.donationDate) || dayjs(),
      denied: !!donation?.denied,
      denyReason: donation?.denyReason || '',
      note: donation?.note || '',
    },
    validationSchema: Yup.object({
      donor: Yup.object().shape({
        id: Yup.string()
          .required('Donor is required')
          .min(1, 'Please select donor'),
      }),
    }),
    onSubmit: async (values) => {
      const newValues = {
        donorId: values.donorId,
        actionId: values.actionId || '',
        denied: values.denied,
        note: values.note,
        denyReason: values.denyReason || null,
        donationDate: values.donationDate.toDate(),
      } as Donation;
      if (donation?.id) {
        await updateDonation({
          ...newValues,
          id: donation.id,
        });
      } else {
        await createDonation(newValues as Donation);
      }
      router.push(ROUTE_PATHS.PROTECTED.DONATIONS.path);
    },
  });

  const onDonorInputChange = (_: React.SyntheticEvent, value: string) => {
    setSearchQuery(value);
  };

  const searchDonorDelayed = React.useMemo(
    () => debounce(onDonorInputChange, 500),
    []
  );

  React.useEffect(() => {
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
            label='Donor'
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

      {!!actions.length && (
        <TextField
          label='Action'
          name='actionId'
          value={formik.values.actionId}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.actionId && Boolean(formik.errors.actionId)}
          helperText={formik.touched.actionId && formik.errors.actionId}
          select
        >
          {actions.map((action) => (
            <MenuItem key={action.id} value={action.id}>
              {action.title}
            </MenuItem>
          ))}
        </TextField>
      )}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          label='Donation date'
          value={formik.values.donationDate}
          onChange={(value) =>
            formik.setFieldValue('donationDate', dayjs(value))
          }
          format={DATE_TIME_FORMAT}
          ampm={false}
        />
      </LocalizationProvider>
      <TextField
        label='Note'
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
        label='Denied'
      />

      {formik.values.denied && (
        <TextField
          label='Denied reason'
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
              {getDenyReasonDescription(reason as DenyReasonType)}
            </MenuItem>
          ))}
        </TextField>
      )}
      <Stack direction='row' justifyContent='space-between' mt={3}>
        {!!donation && (
          <Button
            onClick={() => openDialog({ type: 'delete', donation })}
            variant='outlined'
            disabled={isLoading}
          >
            Delete Donation
          </Button>
        )}
        <Stack direction='row' justifyContent='flex-end' gap={2} ml='auto'>
          <Button
            onClick={() => router.back()}
            variant='outlined'
            disabled={isLoading}
            color='secondary'
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={isLoading || formik.isSubmitting || !formik.isValid}
            color='secondary'
            size='medium'
          >
            Save Changes
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export const DonationCreateUpdateForm = ({ donation }: Props) => {
  return (
    <ActionsProvider>
      <Form donation={donation} />
    </ActionsProvider>
  );
};
