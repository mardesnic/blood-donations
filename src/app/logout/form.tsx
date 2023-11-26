'use client';

import { Button } from '@/components/form/Button';
import { Form } from '@/components/form/Form';
import { Spinner } from '@/components/icons/Spinner';
import { Stack } from '@/components/layout/Stack';
import { ROUTE_PATHS } from '@/routes';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';

export const LogoutForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    try {
      await signOut({ redirect: false });
      router.push(ROUTE_PATHS.PUBLIC.LOGIN);
      return;
    } catch (error) {
      console.warn(error);
      setLoading(false);
      return;
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <Stack direction='row'>
        <Button onClick={() => router.back()}>Cancel</Button>
        <Button type='submit' disabled={loading} color='danger'>
          {loading ? <Spinner /> : <FaSignOutAlt />}
          Sign Out
        </Button>
      </Stack>
    </Form>
  );
};
