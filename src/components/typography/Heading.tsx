import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const Heading = ({ children }: Props) => {
  return <h1 className='text-xl font-bold leading-none'>{children}</h1>;
};
