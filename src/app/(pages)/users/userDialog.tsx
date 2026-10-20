'use client';

import React from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslations } from 'next-intl';
import { Role } from '@/generated/prisma/browser';
import { STAFF_ROLES } from '@/lib/users';
import { useRevalidateOnLocaleChange } from '@/hooks/useRevalidateOnLocaleChange';

export interface UserFormValues {
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

interface Props {
  // Null when adding.
  user: UserFormValues | null;
  // Admins can't change their own role or deactivate themselves.
  isSelf: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (values: UserFormValues) => void;
}

export const UserDialog = ({
  user,
  isSelf,
  saving,
  onClose,
  onSave,
}: Props) => {
  const t = useTranslations();
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const formik = useFormik<UserFormValues>({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || Role.VOLUNTEER,
      active: user?.active ?? true,
    },
    validationSchema: Yup.object({
      name: Yup.string().trim().required(t('validation.nameRequired')),
      email: Yup.string()
        .trim()
        .email(t('validation.emailInvalid'))
        .required(t('validation.emailRequired')),
    }),
    onSubmit: (values) =>
      onSave({
        ...values,
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
      }),
  });
  useRevalidateOnLocaleChange(formik);

  const field = (name: 'name' | 'email') => ({
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: formik.touched[name] && Boolean(formik.errors[name]),
    helperText: formik.touched[name] && formik.errors[name],
  });

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth='xs' fullScreen={isPhone}>
      <DialogTitle>{user ? t('users.edit') : t('users.add')}</DialogTitle>
      <DialogContent>
        <form onSubmit={formik.handleSubmit} noValidate>
          <TextField
            {...field('name')}
            label={t('users.name')}
            required
            autoFocus
          />
          <TextField
            {...field('email')}
            label={t('fields.email')}
            type='email'
            required
          />
          <TextField
            name='role'
            label={t('users.role')}
            value={formik.values.role}
            onChange={formik.handleChange}
            select
            disabled={isSelf}
            helperText={t(`users.roleHelp.${formik.values.role}`)}
          >
            {STAFF_ROLES.map((role) => (
              <MenuItem key={role} value={role}>
                {t(`nav.roles.${role}`)}
              </MenuItem>
            ))}
          </TextField>
          {user && (
            <FormControlLabel
              control={
                <Switch
                  name='active'
                  checked={formik.values.active}
                  onChange={formik.handleChange}
                  disabled={isSelf}
                />
              }
              label={t('users.activeLabel')}
            />
          )}
          {isSelf && (
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
              }}
            >
              {t('users.selfHint')}
            </Typography>
          )}
          {!user && (
            <Typography
              variant='body2'
              sx={{
                color: 'text.secondary',
                mt: 1,
              }}
            >
              {t('users.addHint')}
            </Typography>
          )}
          <Stack
            direction={{ xs: 'column-reverse', sm: 'row' }}
            sx={{
              justifyContent: 'flex-end',
              gap: 2,
              mt: 3,
            }}
          >
            <Button
              variant='outlined'
              color='secondary'
              onClick={onClose}
              disabled={saving}
            >
              {t('common.cancel')}
            </Button>
            <Button type='submit' color='secondary' disabled={saving}>
              {user ? t('common.saveChanges') : t('users.add')}
            </Button>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
};
