'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useState } from 'react';
import { ROUTE_PATHS } from '@/routes';

export const LoginForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const callbackUrl = ROUTE_PATHS.PROTECTED.HOME;

  const onSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: formValues.email,
        password: formValues.password,
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

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        placeholder='Email'
        name='email'
        type='email'
        onChange={handleChange}
        value={formValues.email}
        autoFocus
        required
      />
      <br />
      <input
        placeholder='Password'
        name='password'
        type='password'
        onChange={handleChange}
        value={formValues.password}
        autoFocus
        required
      />
      <br />

      {error && <p>{error}</p>}
      <button type='submit' disabled={loading}>
        Sign In
      </button>
    </form>
  );
};
