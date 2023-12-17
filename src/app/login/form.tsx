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
import { useDictionary } from '@/context/DictionaryContext';

export const LoginForm = () => {
  const router = useRouter();
  const [loginError, setLoginError] = useState('');

  const { dictionary } = useDictionary();
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .required(dictionary?.login.errors.email)
        .email(),
      password: Yup.string().required(dictionary?.login.errors.password),
    }),
    onSubmit: async (values) => {
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (!result?.ok) {
        setLoginError(dictionary?.login.errors.invalid || '');
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
        label={dictionary?.login.email}
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
        label={dictionary?.login.password}
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
        <Button type='submit' disabled={formik.isSubmitting} size='large'>
          {dictionary?.login.signIn}
        </Button>
      </Stack>
    </Box>
  );
};
