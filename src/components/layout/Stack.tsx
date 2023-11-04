import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  direction?: 'row' | 'column';
}

export const Stack = ({ children, direction = 'column' }: Props) => {
  const directionClass = direction === 'column' ? 'flex-col' : '';
  return (
    <div className={`flex ${directionClass} gap-3 items-start`}>{children}</div>
  );
};
