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
import { Action } from '@/generated/prisma/browser';
import { useFormik } from 'formik';
import dayjs from 'dayjs';
import React from 'react';
import { MdEdit } from 'react-icons/md';
import * as Yup from 'yup';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DATE_TIME_FORMAT, MAX_PAGE_SIZE } from '@/lib/const';
import { useGetPlaces } from '@/hooks/usePlaces';
import { useTranslations } from 'next-intl';
import { useRevalidateOnLocaleChange } from '@/hooks/useRevalidateOnLocaleChange';

interface Props {
  action?: Action;
}

const Form = ({ action }: Props) => {
  const { closeDialog, createAction, updateAction, isLoading, place } =
    useActionsContext();
  const t = useTranslations();
  const { data: placesData } = useGetPlaces({
    page: 0,
    pageSize: MAX_PAGE_SIZE,
    sort: 'title|asc',
  });
  const places = placesData?.places || [];

  const formik = useFormik({
    initialValues: {
      title: action?.title || '',
      placeId: action?.placeId || place?.id || '',
      startDateTime: dayjs(action?.startDateTime) || dayjs(),
      endDateTime: dayjs(action?.endDateTime) || dayjs(),
      note: action?.note || '',
    },
    validationSchema: Yup.object({
      title: Yup.string().required(t('validation.titleRequired')),
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
  useRevalidateOnLocaleChange(formik);

  React.useEffect(() => {
    (() => formik.validateForm())();
  }, []);

  return (
    <Box component='form' onSubmit={formik.handleSubmit} noValidate>
      <TextField
        label={t('fields.title')}
        name='title'
        value={formik.values.title}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.title && Boolean(formik.errors.title)}
        helperText={formik.touched.title && formik.errors.title}
        required
      />

      <FormControl fullWidth>
        <InputLabel id='place-label'>{t('fields.place')}</InputLabel>
        <Select
          labelId='place-label'
          id='placeId'
          name='placeId'
          value={formik.values.placeId}
          label={t('fields.place')}
          onChange={formik.handleChange}
        >
          <MenuItem value=''>
            <em>{t('common.none')}</em>
          </MenuItem>
          {places.map((place) => (
            <MenuItem key={place.id} value={place.id}>
              {place.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <DateTimePicker
        label={t('fields.startTime')}
        value={formik.values.startDateTime}
        onChange={(value) =>
          formik.setFieldValue('startDateTime', dayjs(value))
        }
        format={DATE_TIME_FORMAT}
        ampm={false}
      />

      <DateTimePicker
        label={t('fields.endTime')}
        value={formik.values.endDateTime}
        onChange={(value) => formik.setFieldValue('endDateTime', dayjs(value))}
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
      <Stack direction='row' justifyContent='flex-end' gap={2}>
        <Button onClick={closeDialog} variant='outlined' disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button
          type='submit'
          disabled={isLoading || !formik.isValid}
          startIcon={<MdEdit />}
        >
          {t('common.saveChanges')}
        </Button>
      </Stack>
    </Box>
  );
};

export const ActionCreateUpdateForm = ({ action }: Props) => {
  return <Form action={action} />;
};
