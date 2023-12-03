import { usePlacesContext } from '@/context/PlacesContext';
import { Box, Button, Stack, TextField } from '@mui/material';
import { Place } from '@prisma/client';
import { useFormik } from 'formik';
import React from 'react';
import { MdEdit } from 'react-icons/md';
import * as Yup from 'yup';

export const PlaceCreateForm = () => {
  const { closeDialog, createPlace, isLoading } = usePlacesContext();

  const formik = useFormik({
    initialValues: {
      title: '',
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .required('Title is required')
        .min(3, 'Must be 3 characters or more'),
    }),
    onSubmit: async (values) => {
      await createPlace(values as Place);
      closeDialog();
    },
  });

  return (
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
      <Stack direction='row' justifyContent='flex-end' gap={2}>
        <Button onClick={closeDialog} variant='outlined' disabled={isLoading}>
          Cancel
        </Button>
        <Button type='submit' disabled={isLoading} startIcon={<MdEdit />}>
          Save Changes
        </Button>
      </Stack>
    </Box>
  );
};
