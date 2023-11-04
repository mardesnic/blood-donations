'use client';

import { ROUTE_PATHS } from '@/routes';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const LogoutForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // getting session on client
  const { data: session } = useSession();

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
    <form onSubmit={onSubmit}>
      <p>{session?.user?.email}, are you sure you want to sign out?</p>
      <button type='submit' disabled={loading} className='btn'>
        Sign Out
      </button>
    </form>
  );
};
