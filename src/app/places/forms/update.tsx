import { usePlacesContext } from '@/context/PlacesContext';
import { Box, Button, Stack, TextField } from '@mui/material';
import { Place } from '@prisma/client';
import { useFormik } from 'formik';
import { MdEdit } from 'react-icons/md';
import * as Yup from 'yup';

interface Props {
  place: Place;
}

export const PlaceUpdateForm = ({ place }: Props) => {
  const { closeDialog, updatePlace, isLoading } = usePlacesContext();

  const formik = useFormik({
    initialValues: {
      title: place.title,
      address: place.address,
      city: place.city,
      phone: place.phone,
      email: place.email,
      contactName: place.contactName,
      note: place.note,
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .required('Title is required')
        .min(3, 'Must be 3 characters or more'),
      email: Yup.string().email('Email must be a valid email'),
    }),
    onSubmit: async (values) => {
      await updatePlace({
        id: place.id,
        ...values,
      } as Place);
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
        label='Contact Name'
        name='contactName'
        value={formik.values.contactName}
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
  );
};
