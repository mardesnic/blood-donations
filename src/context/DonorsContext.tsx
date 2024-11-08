'use client';

import {
  useCreateDonor,
  useGetDonors,
  useRemoveDonor,
  useUpdateDonor,
} from '@/hooks/useDonors';
import { PAGE_SIZE } from '@/lib/const';
import {
  generateExportDownloadLink,
  generateFilterStringForItems,
  generateSortString,
} from '@/lib/utils';
import {
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { Donor } from '@prisma/client';
import React, { createContext, useContext, useState } from 'react';

interface DeleteDialogI {
  type: 'delete';
  donor: Donor;
}

interface DonorsContextI {
  donors: Donor[];
  donorCount: number;
  isLoading: boolean;
  isFetching: boolean;
  activeDialog: DeleteDialogI | null;
  paginationModel: GridPaginationModel;
  filterModel: GridFilterModel;
  sortModel: GridSortModel;
  openDialog: (dialog: DeleteDialogI) => void;
  createDonor: (data: Partial<Donor>) => Promise<void>;
  updateDonor: (data: Partial<Donor>) => Promise<void>;
  removeDonor: (id: string) => Promise<void>;
  closeDialog: () => void;
  changePaginationModel: (paginationModel: GridPaginationModel) => void;
  changeFilterModel: (filterModel: GridFilterModel) => void;
  changeSortModel: (sortModel: GridSortModel) => void;
  exportDonorsDownloadLink: string;
}

const DonorsContext = createContext({} as DonorsContextI);

export const DonorsProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeDialog, setActiveDialog] = useState<null | DeleteDialogI>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: PAGE_SIZE,
  });
  const [filterModel, setFilterModel] = useState<GridFilterModel>(
    {} as GridFilterModel
  );
  const [sortModel, setSortModel] = useState<GridSortModel>(
    {} as GridSortModel
  );
  const search = filterModel?.quickFilterValues?.join(' ') || '';

  const { isLoading, isFetching, data } = useGetDonors({
    ...paginationModel,
    search,
    filters: generateFilterStringForItems(filterModel),
    sort: generateSortString(sortModel),
  });
  const { mutateAsync: createDonor, isPending: isCreatePending } =
    useCreateDonor();
  const { mutateAsync: updateDonor, isPending: isUpdatePending } =
    useUpdateDonor();
  const { mutateAsync: removeDonor, isPending: isDeletePending } =
    useRemoveDonor();
  const closeDialog = () => setActiveDialog(null);
  const openDialog = (dialog: DeleteDialogI) => setActiveDialog(dialog);
  const donors = data?.donors || [];
  const donorCount = data?.count || 0;
  const changePaginationModel = (paginationModel: GridPaginationModel) =>
    setPaginationModel(paginationModel);
  const changeFilterModel = (filterModel: GridFilterModel) =>
    setFilterModel(filterModel);
  const changeSortModel = (sortModel: GridSortModel) => setSortModel(sortModel);

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
    sortModel,
    changeSortModel,
    exportDonorsDownloadLink: generateExportDownloadLink(
      '/api/donors/export',
      search,
      filterModel,
      sortModel
    ),
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
