'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ROUTE_PATHS } from '@/routes';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';

export const LoginForm = () => {
  const router = useRouter();
  const [loginError, setLoginError] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().required('Email is required').email(),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values) => {
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (!result?.ok) {
        setLoginError('Invalid email or password.');
        return;
      }
      setLoginError('');
      router.push(ROUTE_PATHS.PROTECTED.HOME.path);
    },
  });

  return (
    <Box component='form' onSubmit={formik.handleSubmit} noValidate>
      <TextField
        margin='normal'
        required
        id='email'
        label='Email Address'
        name='email'
        autoComplete='email'
        autoFocus
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
        label='Password'
        type='password'
        id='password'
        autoComplete='current-password'
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
      />
      <Stack direction='row' justifyContent='flex-end' sx={{ mt: 2 }}>
        <Button type='submit' disabled={formik.isSubmitting}>
          Sign In
        </Button>
      </Stack>
    </Box>
  );
};
