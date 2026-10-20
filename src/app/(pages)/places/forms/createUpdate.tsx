'use client';

import { Box, Button, Stack, TextField } from '@mui/material';
import { Place } from '@/generated/prisma/browser';
import { useFormik } from 'formik';
import React from 'react';
import { MdEdit } from 'react-icons/md';
import * as Yup from 'yup';
import { useTranslations } from 'next-intl';
import { useRevalidateOnLocaleChange } from '@/hooks/useRevalidateOnLocaleChange';

export type PlaceFormValues = Pick<
  Place,
  'title' | 'address' | 'city' | 'contactName' | 'phone' | 'email' | 'note'
>;

interface Props {
  place?: Place | null;
  isLoading: boolean;
  onSubmit: (values: PlaceFormValues) => Promise<void>;
  onCancel: () => void;
}

const TEXT_FIELDS = [
  'address',
  'city',
  'contactName',
  'phone',
  'email',
] as const;

// Used on the Places page and to add a place from the action form.
export const PlaceCreateUpdateForm = ({
  place,
  isLoading,
  onSubmit,
  onCancel,
}: Props) => {
  const t = useTranslations();

  const shortText = () => Yup.string().trim().max(100, t('validation.tooLong'));
  const formik = useFormik({
    initialValues: {
      title: place?.title || '',
      address: place?.address || '',
      city: place?.city || '',
      contactName: place?.contactName || '',
      phone: place?.phone || '',
      email: place?.email || '',
      note: place?.note || '',
    },
    validationSchema: Yup.object({
      title: shortText().required(t('validation.titleRequired')),
      address: shortText(),
      city: shortText(),
      contactName: shortText(),
      phone: shortText(),
      email: shortText().email(t('validation.emailInvalid')),
    }),
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });
  useRevalidateOnLocaleChange(formik);

  const fieldProps = (name: keyof typeof formik.values) => ({
    name,
    label: t(`fields.${name}`),
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: formik.touched[name] && Boolean(formik.errors[name]),
    helperText: formik.touched[name] && formik.errors[name],
  });

  return (
    <Box component='form' onSubmit={formik.handleSubmit} noValidate>
      <TextField {...fieldProps('title')} required autoFocus />
      {TEXT_FIELDS.map((name) => (
        <TextField key={name} {...fieldProps(name)} />
      ))}
      <TextField {...fieldProps('note')} multiline minRows={2} />
      <Stack
        direction='row'
        sx={{
          justifyContent: 'flex-end',
          gap: 2,
          mt: 1,
        }}
      >
        <Button onClick={onCancel} variant='outlined' disabled={isLoading}>
          {t('common.cancel')}
        </Button>
        <Button
          type='submit'
          disabled={isLoading || formik.isSubmitting}
          startIcon={<MdEdit />}
        >
          {t('common.saveChanges')}
        </Button>
      </Stack>
    </Box>
  );
};
