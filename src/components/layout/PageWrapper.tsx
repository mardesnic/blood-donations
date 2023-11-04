import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const PageWrapper = ({ children }: Props) => {
  return <div className='py-3'>{children}</div>;
};
