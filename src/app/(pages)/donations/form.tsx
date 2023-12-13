import React from 'react';
import { useDonationsContext } from '@/context/DonationsContext';
import { useActionsContext, ActionsProvider } from '@/context/ActionsContext';
import { Box, Button, MenuItem, Stack } from '@mui/material';
import { Donation, Donor } from '@prisma/client';
import { useFormik } from 'formik';
import { MdEdit } from 'react-icons/md';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { DonorsProvider, useDonorsContext } from '@/context/DonorsContext';
import CircularProgress from '@mui/material/CircularProgress';
import { debounce } from '@mui/material/utils';

interface Props {
  donation?: Donation;
}

const Form = ({ donation }: Props) => {
  const { closeDialog, createDonation, updateDonation, isLoading } =
    useDonationsContext();

  const {
    donors,
    isLoading: isDonorsLoading,
    filterModel,
    changeFilterModel,
  } = useDonorsContext();

  const { actions } = useActionsContext();

  const formik = useFormik({
    initialValues: {
      donorId: '',
      actionId: '',
      note: '',
    },
    onSubmit: async (values) => {
      if (donation?.id) {
        await updateDonation({
          ...values,
          id: donation.id,
        });
      } else {
        await createDonation(values as Donation);
      }
      closeDialog();
    },
  });

  const onDonorInputChange = (event: React.SyntheticEvent, value: string) => {
    changeFilterModel({
      ...filterModel,
      quickFilterValues: [value],
    });
  };

  const searchDonorDelayed = React.useMemo(
    () => debounce(onDonorInputChange, 500),
    [onDonorInputChange]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component='form' onSubmit={formik.handleSubmit} noValidate>
        <Autocomplete
          disablePortal
          fullWidth
          id='donors-selector'
          options={donors}
          onChange={(event, value) => {
            formik.setFieldValue('donorId', value?.id);
          }}
          onInputChange={searchDonorDelayed}
          getOptionKey={(option: Donor) => option.id}
          getOptionLabel={(option) => option.fullName || ''}
          renderInput={(params) => (
            <TextField
              {...params}
              label='Donor'
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

        <TextField
          label='Note'
          name='note'
          value={formik.values.note}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        <Stack direction='row' justifyContent='flex-end' gap={2}>
          <Button onClick={closeDialog} variant='outlined' disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={isLoading || !formik.isValid}
            startIcon={<MdEdit />}
          >
            Save Changes
          </Button>
        </Stack>
      </Box>
    </LocalizationProvider>
  );
};

export const DonationForm = ({ donation }: Props) => {
  return (
    <DonorsProvider>
      <ActionsProvider>
        <Form donation={donation} />
      </ActionsProvider>
    </DonorsProvider>
  );
};
