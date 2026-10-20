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
import { Action, Place } from '@/generated/prisma/browser';
import { useFormik } from 'formik';
import dayjs from 'dayjs';
import React from 'react';
import { MdAdd, MdEdit } from 'react-icons/md';
import * as Yup from 'yup';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DATE_TIME_FORMAT, MAX_PAGE_SIZE } from '@/lib/const';
import { useGetPlaces } from '@/hooks/usePlaces';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useRevalidateOnLocaleChange } from '@/hooks/useRevalidateOnLocaleChange';
import { PlaceQuickAddDialog } from '@/app/(pages)/places/dialogs/quickAdd';

// Select option that opens the quick-add dialog instead of picking a place.
const NEW_PLACE = '__new__';

interface Props {
  action?: Action;
}

const Form = ({ action }: Props) => {
  const { closeDialog, createAction, updateAction, isLoading, place } =
    useActionsContext();
  const router = useRouter();
  const t = useTranslations();
  const { data: placesData } = useGetPlaces({
    page: 0,
    pageSize: MAX_PAGE_SIZE,
    sort: 'title|asc',
  });
  // A place added from this form is listed until the places list reloads.
  const [addedPlace, setAddedPlace] = React.useState<Place | null>(null);
  const [showQuickAdd, setShowQuickAdd] = React.useState(false);
  const places = React.useMemo(() => {
    const list: Place[] = placesData?.places || [];
    return addedPlace && !list.some((p) => p.id === addedPlace.id)
      ? [...list, addedPlace].sort((a, b) => a.title.localeCompare(b.title))
      : list;
  }, [placesData, addedPlace]);

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
      // The action's own page is rendered on the server.
      router.refresh();
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
          onChange={(event) => {
            if (event.target.value === NEW_PLACE) {
              setShowQuickAdd(true);
              return;
            }
            formik.handleChange(event);
          }}
        >
          <MenuItem value=''>
            <em>{t('common.none')}</em>
          </MenuItem>
          {places.map((place) => (
            <MenuItem key={place.id} value={place.id}>
              {place.title}
            </MenuItem>
          ))}
          <MenuItem value={NEW_PLACE} sx={{ gap: 1, color: 'primary.main' }}>
            <MdAdd />
            {t('places.quickAdd')}
          </MenuItem>
        </Select>
      </FormControl>
      <PlaceQuickAddDialog
        open={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onCreated={(place) => {
          setAddedPlace(place);
          formik.setFieldValue('placeId', place.id);
        }}
      />

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
      <Stack
        direction='row'
        sx={{
          justifyContent: 'flex-end',
          gap: 2,
        }}
      >
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
