import { Container } from '@mui/material';
import React, { ReactNode } from 'react';
import { TopBar } from './TopBar';

interface Props {
  children: ReactNode;
}

export const PageWrapper = ({ children }: Props) => {
  return (
    <>
      <TopBar />
      <Container component='main' maxWidth='xl' sx={{ py: 3 }}>
        {children}
      </Container>
    </>
  );
};
