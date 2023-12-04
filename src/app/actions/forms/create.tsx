import { useActionsContext } from '@/context/ActionsContext';
import { Box, Button, Stack, TextField } from '@mui/material';
import { Action } from '@prisma/client';
import { useFormik } from 'formik';
import dayjs from 'dayjs';
import React from 'react';
import { MdEdit } from 'react-icons/md';
import * as Yup from 'yup';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

export const ActionCreateForm = () => {
  const { closeDialog, createAction, isLoading } = useActionsContext();

  const formik = useFormik({
    initialValues: {
      title: '',
      startDateTime: dayjs(),
      endDateTime: dayjs(),
      note: '',
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .required('Title is required')
        .min(3, 'Must be 3 characters or more'),
    }),
    onSubmit: async (values) => {
      await createAction({
        ...values,
        startDateTime: values.startDateTime.toDate(),
        endDateTime: values.endDateTime.toDate(),
      } as Action);
      closeDialog();
    },
  });

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

        <DateTimePicker
          label='Start time'
          value={formik.values.startDateTime}
          onChange={(value) =>
            formik.setFieldValue('startDateTime', dayjs(value))
          }
          format='DD/MM/YYYY HH:mm'
          ampm={false}
        />

        <DateTimePicker
          label='End time'
          value={formik.values.endDateTime}
          onChange={(value) =>
            formik.setFieldValue('endDateTime', dayjs(value))
          }
          format='DD/MM/YYYY HH:mm'
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
          <Button type='submit' disabled={isLoading} startIcon={<MdEdit />}>
            Save Changes
          </Button>
        </Stack>
      </Box>
    </LocalizationProvider>
  );
};
