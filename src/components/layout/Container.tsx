import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const Container = ({ children }: Props) => {
  return <div className='w-full max-w-lg mx-auto px-3'>{children}</div>;
};
