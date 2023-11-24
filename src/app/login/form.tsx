'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ROUTE_PATHS } from '@/routes';import { Button } from '@/components/form/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

export const LoginForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const callbackUrl = ROUTE_PATHS.PROTECTED.HOME;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    event.preventDefault();
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
      <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
      >
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
          />
          <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
          />
          <Button
              type="submit"
              fullWidth={true}
              variant="contained"
          >
            Sign In
          </Button>
        </Box>
      </Box>
  );
};
