'use client';

import { useGetActions, useRemoveAction } from '@/hooks/useActions';
import { Action } from '@prisma/client';
import React, { createContext, useContext } from 'react';

interface ActionsContextI {
  actions: Action[];
  isLoading: boolean;
  isFetching: boolean;
  removeAction: (id: string) => void;
}

const ActionsContext = createContext({} as ActionsContextI);

export const ActionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isLoading, isFetching, data: actions = [] } = useGetActions();
  const { mutateAsync: removeAction } = useRemoveAction();
  const values: ActionsContextI = {
    actions,
    isLoading,
    isFetching,
    removeAction,
  };

  return (
    <ActionsContext.Provider value={values}>{children}</ActionsContext.Provider>
  );
};

export const useActionsContext = () => {
  const context = useContext(ActionsContext);
  if (context === undefined) {
    throw new Error('useActionsContext must be used within a ActionsProvider');
  }
  return context;
};
