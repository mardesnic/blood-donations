'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ROUTE_PATHS } from '@/routes';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

export const LoginForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const callbackUrl = ROUTE_PATHS.PROTECTED.HOME.path;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const data = new FormData(event.currentTarget);
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: data.get('email'),
        password: data.get('password'),
      });
      if (!res?.ok) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }
      setError('');
      router.push(callbackUrl);
      return;
    } catch (error) {
      console.warn(error);
      setError('Something went wrong, try again later!');
      setLoading(false);
      return;
    }
  };

  return (
    <Box component='form' onSubmit={onSubmit} noValidate>
      <TextField
        margin='normal'
        required
        id='email'
        label='Email Address'
        name='email'
        autoComplete='email'
        error={!!error}
        helperText={error}
        autoFocus
      />
      <TextField
        margin='normal'
        required
        name='password'
        label='Password'
        type='password'
        id='password'
        autoComplete='current-password'
      />
      <Stack direction='row' justifyContent='flex-end' sx={{ mt: 2 }}>
        <Button type='submit' disabled={loading}>
          Sign In
        </Button>
      </Stack>
    </Box>
  );
};
