import { useDonationsContext } from '@/context/DonationsContext';
import { Box, Button, Stack } from '@mui/material';
import { Donation } from '@prisma/client';
import { useFormik } from 'formik';
import React from 'react';
import { MdEdit } from 'react-icons/md';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

interface Props {
  donation?: Donation;
}

const Form = ({ donation }: Props) => {
  const { closeDialog, createDonation, updateDonation, isLoading } =
    useDonationsContext();

  const formik = useFormik({
    initialValues: {},
    // validationSchema: Yup.object({
    //   title: Yup.string()
    //     .required('Title is required')
    //     .min(3, 'Must be 3 characters or more'),
    // }),
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component='form' onSubmit={formik.handleSubmit} noValidate>
        {/*<TextField*/}
        {/*  label='Title'*/}
        {/*  name='title'*/}
        {/*  value={formik.values.title}*/}
        {/*  onChange={formik.handleChange}*/}
        {/*  onBlur={formik.handleBlur}*/}
        {/*  error={formik.touched.title && Boolean(formik.errors.title)}*/}
        {/*  helperText={formik.touched.title && formik.errors.title}*/}
        {/*  required*/}
        {/*/>*/}

        {/*<FormControl fullWidth>*/}
        {/*  <InputLabel id='place-label'>Place</InputLabel>*/}
        {/*  <Select*/}
        {/*    labelId='place-label'*/}
        {/*    id='placeId'*/}
        {/*    name='placeId'*/}
        {/*    value={formik.values.placeId}*/}
        {/*    label='Place'*/}
        {/*    onChange={formik.handleChange}*/}
        {/*  >*/}
        {/*    <MenuItem value=''>*/}
        {/*      <em>None</em>*/}
        {/*    </MenuItem>*/}
        {/*    {places.map((place) => (*/}
        {/*      <MenuItem key={place.id} value={place.id}>*/}
        {/*        {place.title}*/}
        {/*      </MenuItem>*/}
        {/*    ))}*/}
        {/*  </Select>*/}
        {/*</FormControl>*/}

        {/*<DateTimePicker*/}
        {/*  label='Start time'*/}
        {/*  value={formik.values.startDateTime}*/}
        {/*  onChange={(value) =>*/}
        {/*    formik.setFieldValue('startDateTime', dayjs(value))*/}
        {/*  }*/}
        {/*  format={DATE_TIME_FORMAT}*/}
        {/*  ampm={false}*/}
        {/*/>*/}

        {/*<DateTimePicker*/}
        {/*  label='End time'*/}
        {/*  value={formik.values.endDateTime}*/}
        {/*  onChange={(value) =>*/}
        {/*    formik.setFieldValue('endDateTime', dayjs(value))*/}
        {/*  }*/}
        {/*  format={DATE_TIME_FORMAT}*/}
        {/*  ampm={false}*/}
        {/*/>*/}

        {/*<TextField*/}
        {/*  label='Note'*/}
        {/*  name='note'*/}
        {/*  value={formik.values.note}*/}
        {/*  onChange={formik.handleChange}*/}
        {/*  onBlur={formik.handleBlur}*/}
        {/*/>*/}
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
      x
    </LocalizationProvider>
  );
};

export const DonationForm = ({ donation }: Props) => {
  return <Form donation={donation} />;
};
