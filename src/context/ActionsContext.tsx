'use client';

import {
  useCreateAction,
  useGetActions,
  useRemoveAction,
  useUpdateAction,
} from '@/hooks/useActions';
import { Action, Place, Prisma } from '@prisma/client';
import React, { createContext, useContext, useState } from 'react';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { PAGE_SIZE } from '@/lib/const';
import { generateSortString } from '@/lib/utils';

export type ActionWithPlace = Prisma.ActionGetPayload<{
  include: { place: true };
}>;

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
  actions: ActionWithPlace[];
  count: number;
  isLoading: boolean;
  isFetching: boolean;
  activeDialog: DialogType;
  openDialog: (dialog: DialogType) => void;
  createAction: (data: Partial<Action>) => Promise<void>;
  updateAction: (data: Partial<Action>) => Promise<void>;
  removeAction: (id: string) => Promise<void>;
  closeDialog: () => void;
  paginationModel: GridPaginationModel;
  changePaginationModel: (paginationModel: GridPaginationModel) => void;
  sortModel: GridSortModel;
  changeSortModel: (sortModel: GridSortModel) => void;
  place?: Place;
}

const ActionsContext = createContext({} as ActionsContextI);

export const ActionsProvider = ({
  children,
  place,
}: {
  children: React.ReactNode;
  place?: Place;
}) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: PAGE_SIZE,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>(
    {} as GridSortModel
  );
  const { isLoading, isFetching, data } = useGetActions(
    {
      ...paginationModel,
      sort: generateSortString(sortModel),
    },
    place?.id || ''
  );
  const { mutateAsync: createAction, isPending: isCreatePending } =
    useCreateAction();
  const { mutateAsync: updateAction, isPending: isUpdatePending } =
    useUpdateAction();
  const { mutateAsync: removeAction, isPending: isDeletePending } =
    useRemoveAction();
  const [activeDialog, setActiveDialog] = useState<null | DialogType>(null);
  const closeDialog = () => setActiveDialog(null);
  const openDialog = (dialog: DialogType) => setActiveDialog(dialog);

  const changePaginationModel = (paginationModel: GridPaginationModel) =>
    setPaginationModel(paginationModel);
  const changeSortModel = (sortModel: GridSortModel) => setSortModel(sortModel);

  const values: ActionsContextI = {
    actions: data?.actions || [],
    count: data?.count || 0,
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
    paginationModel,
    changePaginationModel,
    sortModel,
    changeSortModel,
    place,
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
