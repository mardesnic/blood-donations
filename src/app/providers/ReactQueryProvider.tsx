'use client';

import {
  MutationCache,
  QueryClient,
  QueryCache,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { useAlertContext } from '@/context/AlertContext';

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showAlert } = useAlertContext();
  const onError = (error: Error) => showAlert(error.message, 'error');
  const [client] = useState(
    new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          refetchOnMount: false,
          staleTime: Infinity,
          retry: false,
        },
      },
      mutationCache: new MutationCache({ onError }),
      queryCache: new QueryCache({ onError }),
    })
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
