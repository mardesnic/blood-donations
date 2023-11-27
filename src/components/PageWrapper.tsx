import { Container } from '@mui/material';
import React, { ReactNode } from 'react';
import { MainNavigation } from './MainNavigation';

interface Props {
  children: ReactNode;
}

export const PageWrapper = ({ children }: Props) => {
  return (
    <>
      <MainNavigation />
      <Container sx={{ py: 3 }}>{children}</Container>
    </>
  );
};
