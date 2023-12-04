'use client';

import {
  useCreateAction,
  useGetActions,
  useRemoveAction,
  useUpdateAction,
} from '@/hooks/useActions';
import { Action } from '@prisma/client';
import React, { createContext, useContext, useState } from 'react';

interface DeleteDialogI {
  type: 'delete';
  action: Action;
}

interface UpdateDialogI {
  type: 'update';
  action: Action;
}

interface CreateDialogI {
  type: 'create';
}

type DialogType = null | DeleteDialogI | UpdateDialogI | CreateDialogI;

interface ActionsContextI {
  actions: Action[];
  isLoading: boolean;
  isFetching: boolean;
  activeDialog: DialogType;
  openDialog: (dialog: DialogType) => void;
  createAction: (data: Partial<Action>) => Promise<void>;
  updateAction: (data: Partial<Action>) => Promise<void>;
  removeAction: (id: string) => Promise<void>;
  closeDialog: () => void;
}

const ActionsContext = createContext({} as ActionsContextI);

export const ActionsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isLoading, isFetching, data: actions = [] } = useGetActions();
  const { mutateAsync: createAction, isPending: isCreatePending } =
    useCreateAction();
  const { mutateAsync: updateAction, isPending: isUpdatePending } =
    useUpdateAction();
  const { mutateAsync: removeAction, isPending: isDeletePending } =
    useRemoveAction();
  const [activeDialog, setActiveDialog] = useState<null | DialogType>(null);
  const closeDialog = () => setActiveDialog(null);
  const openDialog = (dialog: DialogType) => setActiveDialog(dialog);

  const values: ActionsContextI = {
    actions,
    isLoading:
      isLoading ||
      isFetching ||
      isDeletePending ||
      isCreatePending ||
      isUpdatePending,
    isFetching,
    createAction,
    updateAction,
    removeAction,
    activeDialog,
    closeDialog,
    openDialog,
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
