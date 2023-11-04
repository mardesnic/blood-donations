import React, { ReactNode } from 'react';

interface Props {
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
}

export const Form = ({ onSubmit, children }: Props) => {
  return <form onSubmit={onSubmit}>{children}</form>;
};
