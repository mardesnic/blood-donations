import { useActionsContext } from '@/context/ActionsContext';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { Action } from '@prisma/client';
import { useFormik } from 'formik';
import dayjs from 'dayjs';
import React from 'react';
import { MdEdit } from 'react-icons/md';
import * as Yup from 'yup';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DATE_TIME_FORMAT } from '@/lib/const';
import { PlacesProvider, usePlacesContext } from '@/context/PlacesContext';

interface Props {
  action?: Action;
}

const Form = ({ action }: Props) => {
  const { closeDialog, createAction, updateAction, isLoading } =
    useActionsContext();
  const { places } = usePlacesContext();

  const formik = useFormik({
    initialValues: {
      title: action?.title || '',
      placeId: action?.placeId || '',
      startDateTime: dayjs(action?.startDateTime) || dayjs(),
      endDateTime: dayjs(action?.endDateTime) || dayjs(),
      note: action?.note || '',
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .required('Title is required')
        .min(3, 'Must be 3 characters or more'),
    }),
    onSubmit: async (values) => {
      const newValues = {
        ...values,
        startDateTime: values.startDateTime.toDate(),
        endDateTime: values.endDateTime.toDate(),
      };
      if (action?.id) {
        await updateAction({
          ...newValues,
          id: action.id,
        });
      } else {
        await createAction(newValues as Action);
      }
      closeDialog();
    },
  });

  console.log('formik ', formik);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component='form' onSubmit={formik.handleSubmit} noValidate>
        <TextField
          label='Title'
          name='title'
          value={formik.values.title}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.title && Boolean(formik.errors.title)}
          helperText={formik.touched.title && formik.errors.title}
          required
        />

        <FormControl fullWidth>
          <InputLabel id='place-label'>Place</InputLabel>
          <Select
            labelId='place-label'
            id='placeId'
            name='placeId'
            value={formik.values.placeId}
            label='Place'
            onChange={formik.handleChange}
          >
            <MenuItem value=''>
              <em>None</em>
            </MenuItem>
            {places.map((place) => (
              <MenuItem key={place.id} value={place.id}>
                {place.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <DateTimePicker
          label='Start time'
          value={formik.values.startDateTime}
          onChange={(value) =>
            formik.setFieldValue('startDateTime', dayjs(value))
          }
          format={DATE_TIME_FORMAT}
          ampm={false}
        />

        <DateTimePicker
          label='End time'
          value={formik.values.endDateTime}
          onChange={(value) =>
            formik.setFieldValue('endDateTime', dayjs(value))
          }
          format={DATE_TIME_FORMAT}
          ampm={false}
        />

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

export const ActionForm = ({ action }: Props) => {
  return (
    <PlacesProvider>
      <Form action={action} />
    </PlacesProvider>
  );
};
