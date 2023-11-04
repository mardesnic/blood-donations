'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useState } from 'react';
import { ROUTE_PATHS } from '@/routes';
import { Form } from '@/components/form/Form';
import { Button } from '@/components/form/Button';
import { InputText } from '@/components/form/InputText';
import { Stack } from '@/components/layout/Stack';
import { Spinner } from '@/components/icons/Spinner';
import { FaSignInAlt } from 'react-icons/fa';

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
    <Form onSubmit={onSubmit}>
      <Stack>
        <InputText
          placeholder='Email'
          name='email'
          type='email'
          onChange={handleChange}
          value={formValues.email}
          autoFocus={true}
          required={true}
        />
        <InputText
          placeholder='Password'
          name='password'
          type='password'
          onChange={handleChange}
          value={formValues.password}
          autoFocus
          required
        />
        {error && <p>{error}</p>}
        <Button type='submit' disabled={loading} color='primary'>
          {loading ? <Spinner /> : <FaSignInAlt />}
          Sign In
        </Button>
      </Stack>
    </Form>
  );
};
