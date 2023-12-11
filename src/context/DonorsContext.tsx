'use client';

import {
  useCreateDonor,
  useGetDonors,
  useRemoveDonor,
  useUpdateDonor,
} from '@/hooks/useDonors';
import { PAGE_SIZE } from '@/lib/const';
import { GridFilterModel, GridPaginationModel } from '@mui/x-data-grid';
import { Donor } from '@prisma/client';
import React, { createContext, useContext, useState } from 'react';

interface DeleteDialogI {
  type: 'delete';
  donor: Donor;
}

interface UpdateDialogI {
  type: 'update';
  donor: Donor;
}

interface CreateDialogI {
  type: 'create';
}

type DialogType = null | DeleteDialogI | UpdateDialogI | CreateDialogI;

interface DonorsContextI {
  donors: Donor[];
  donorCount: number;
  isLoading: boolean;
  isFetching: boolean;
  activeDialog: DialogType;
  paginationModel: GridPaginationModel;
  filterModel: GridFilterModel;
  openDialog: (dialog: DialogType) => void;
  createDonor: (data: Partial<Donor>) => Promise<void>;
  updateDonor: (data: Partial<Donor>) => Promise<void>;
  removeDonor: (id: string) => Promise<void>;
  closeDialog: () => void;
  changePaginationModel: (paginationModel: GridPaginationModel) => void;
  changeFilterModel: (filterModel: GridFilterModel) => void;
}

const DonorsContext = createContext({} as DonorsContextI);

export const DonorsProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeDialog, setActiveDialog] = useState<null | DialogType>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: PAGE_SIZE,
  });
  const [filterModel, setFilterModel] = useState<GridFilterModel>(
    {} as GridFilterModel
  );
  const { isLoading, isFetching, data } = useGetDonors({
    ...paginationModel,
    search: filterModel?.quickFilterValues?.join('|') || '',
    filter: JSON.stringify(filterModel.items) || '',
  });
  const { mutateAsync: createDonor, isPending: isCreatePending } =
    useCreateDonor();
  const { mutateAsync: updateDonor, isPending: isUpdatePending } =
    useUpdateDonor();
  const { mutateAsync: removeDonor, isPending: isDeletePending } =
    useRemoveDonor();
  const closeDialog = () => setActiveDialog(null);
  const openDialog = (dialog: DialogType) => setActiveDialog(dialog);
  const donors = data?.donors || [];
  const donorCount = data?.count || 0;
  const changePaginationModel = (paginationModel: GridPaginationModel) =>
    setPaginationModel(paginationModel);
  const changeFilterModel = (filterModel: GridFilterModel) =>
    setFilterModel(filterModel);

  const values: DonorsContextI = {
    donors,
    donorCount,
    isLoading:
      isLoading || isDeletePending || isCreatePending || isUpdatePending,
    isFetching,
    createDonor,
    updateDonor,
    removeDonor,
    activeDialog,
    closeDialog,
    openDialog,
    paginationModel,
    changePaginationModel,
    filterModel,
    changeFilterModel,
  };

  return (
    <DonorsContext.Provider value={values}>{children}</DonorsContext.Provider>
  );
};

export const useDonorsContext = () => {
  const context = useContext(DonorsContext);
  if (context === undefined) {
    throw new Error('useDonorsContext must be used within a DonorsProvider');
  }
  return context;
};
