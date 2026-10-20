'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Alert, Button, Card, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslations } from 'next-intl';
import { MIN_PASSWORD_LENGTH, passwordProblem } from '@/lib/users';
import { ROUTE_PATHS } from '@/routes';
import { useAlertContext } from '@/context/AlertContext';
import { useRevalidateOnLocaleChange } from '@/hooks/useRevalidateOnLocaleChange';

export const ChangePasswordForm = ({ temporary }: { temporary: boolean }) => {
  const t = useTranslations('account');
  const router = useRouter();
  const { update } = useSession();
  const { showAlert } = useAlertContext();
  const [error, setError] = React.useState('');

  const formik = useFormik({
    initialValues: { currentPassword: '', newPassword: '', repeat: '' },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required(t('currentRequired')),
      newPassword: Yup.string()
        .required(t('errors.TOO_SHORT', { min: MIN_PASSWORD_LENGTH }))
        .test('rules', '', function (value) {
          const problem = passwordProblem(value);
          return problem
            ? this.createError({
                message: t(`errors.${problem}`, { min: MIN_PASSWORD_LENGTH }),
              })
            : true;
        }),
      repeat: Yup.string().oneOf([Yup.ref('newPassword')], t('mismatch')),
    }),
    onSubmit: async (values) => {
      setError('');
      const response = await fetch('/api/account/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const code = body?.code || body?.errors?.[0];
        setError(
          t.has(`errors.${code}`)
            ? t(`errors.${code}`, { min: MIN_PASSWORD_LENGTH })
            : t('errors.FAILED')
        );
        return;
      }
      // Clears the "temporary password" flag in the session token.
      await update();
      showAlert(t('changed'), 'success');
      router.push(ROUTE_PATHS.PROTECTED.OVERVIEW.path);
      router.refresh();
    },
  });
  useRevalidateOnLocaleChange(formik);

  const field = (name: 'currentPassword' | 'newPassword' | 'repeat') => ({
    name,
    type: 'password',
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: formik.touched[name] && Boolean(formik.errors[name]),
    helperText: formik.touched[name] && formik.errors[name],
  });

  return (
    <>
      <Typography variant='h1'>{t('title')}</Typography>
      {temporary && (
        <Alert severity='info' sx={{ mt: 2 }}>
          {t('temporary')}
        </Alert>
      )}
      <Card raised sx={{ mt: 3, p: { xs: '24px 16px', sm: '30px 24px' } }}>
        <form onSubmit={formik.handleSubmit} noValidate>
          <TextField
            {...field('currentPassword')}
            label={temporary ? t('temporaryPassword') : t('current')}
            autoComplete='current-password'
            autoFocus
          />
          <TextField
            {...field('newPassword')}
            label={t('new')}
            autoComplete='new-password'
          />
          <TextField
            {...field('repeat')}
            label={t('repeat')}
            autoComplete='new-password'
          />
          {error && (
            <Typography color='error.main' sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button
            type='submit'
            color='secondary'
            fullWidth
            sx={{ mt: 3 }}
            disabled={formik.isSubmitting}
          >
            {t('save')}
          </Button>
        </form>
      </Card>
    </>
  );
};
