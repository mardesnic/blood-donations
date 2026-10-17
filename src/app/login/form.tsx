'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ROUTE_PATHS } from '@/routes';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';
import { TOO_MANY_ATTEMPTS } from '@/lib/const';
import { useTranslations } from 'next-intl';
import { useRevalidateOnLocaleChange } from '@/hooks/useRevalidateOnLocaleChange';

export const LoginForm = () => {
  const router = useRouter();
  const t = useTranslations();
  const [loginError, setLoginError] = useState('');
  // Stays true after a successful sign-in until the next page replaces this
  // one, so the form can't be submitted again while it loads.
  const [redirecting, setRedirecting] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .required(t('validation.emailRequired'))
        .email(t('validation.emailInvalid')),
      password: Yup.string().required(t('validation.passwordRequired')),
    }),
    onSubmit: async (values) => {
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (!result?.ok) {
        setLoginError(
          result?.error === TOO_MANY_ATTEMPTS
            ? t('login.tooManyAttempts')
            : t('login.invalid')
        );
        return;
      }
      setLoginError('');
      setRedirecting(true);
      router.push(ROUTE_PATHS.PROTECTED.DONORS.path);
    },
  });
  useRevalidateOnLocaleChange(formik);
  const loading = formik.isSubmitting || redirecting;

  return (
    <Box component='form' onSubmit={formik.handleSubmit} noValidate>
      <TextField
        margin='normal'
        required
        id='email'
        label={t('login.email')}
        name='email'
        autoComplete='email'
        autoFocus
        disabled={loading}
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={
          !!loginError || (formik.touched.email && Boolean(formik.errors.email))
        }
        helperText={loginError || (formik.touched.email && formik.errors.email)}
      />
      <TextField
        margin='normal'
        required
        name='password'
        label={t('login.password')}
        type='password'
        id='password'
        autoComplete='current-password'
        disabled={loading}
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
      />
      <Stack direction='row' justifyContent='flex-end' sx={{ mt: 2 }}>
        <Button
          type='submit'
          disabled={loading}
          size='large'
          startIcon={
            loading ? <CircularProgress size={18} color='inherit' /> : null
          }
        >
          {loading ? t('login.signingIn') : t('login.submit')}
        </Button>
      </Stack>
      <Backdrop
        open={loading}
        sx={(theme) => ({
          zIndex: theme.zIndex.modal + 1,
          color: '#fff',
          flexDirection: 'column',
          gap: 2,
        })}
      >
        <CircularProgress color='inherit' />
        <Typography>
          {redirecting ? t('login.loadingDonors') : t('login.signingIn')}
        </Typography>
      </Backdrop>
    </Box>
  );
};
