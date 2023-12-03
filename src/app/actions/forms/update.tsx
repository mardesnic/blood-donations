import { useActionsContext } from '@/context/ActionsContext';
import { Box, Button, Stack, TextField } from '@mui/material';
import { Action } from '@prisma/client';
import { useFormik } from 'formik';
import { MdEdit } from 'react-icons/md';
import * as Yup from 'yup';

interface Props {
  action: Action;
}

export const ActionUpdateForm = ({ action }: Props) => {
  const { closeDialog, updateAction, isLoading } = useActionsContext();

  const formik = useFormik({
    initialValues: {
      title: action.title,
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .required('Title is required')
        .min(3, 'Must be 3 characters or more'),
    }),
    onSubmit: async (values) => {
      await updateAction({
        id: action.id,
        ...values,
      } as Action);
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
