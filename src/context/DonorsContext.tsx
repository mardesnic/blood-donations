'use client';

import {
  useCreateDonor,
  useGetDonors,
  useRemoveDonor,
  useUpdateDonor,
  DonorListItem,
} from '@/hooks/useDonors';
import { PAGE_SIZE } from '@/lib/const';
import {
  filterModelFromSearchParams,
  filterModelToSearchParams,
} from '@/lib/donorFilterModel';
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
import { Donor } from '@/generated/prisma/browser';
import React, { createContext, useContext, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface DeleteDialogI {
  type: 'delete';
  donor: Donor;
}

interface DonorsContextI {
  donors: DonorListItem[];
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
  // Takes a new model or a function of the current one, so delayed updates
  // (search, city) don't overwrite filters set in the meantime.
  changeFilterModel: React.Dispatch<React.SetStateAction<GridFilterModel>>;
  changeSortModel: (sortModel: GridSortModel) => void;
  exportDonorsDownloadLink: string;
  urlVersion: number;
}

const DonorsContext = createContext({} as DonorsContextI);

export const DonorsProvider = ({ children }: { children: React.ReactNode }) => {
  // Filters and search start from the URL (see filterModelToSearchParams), so
  // back, refresh and shared links show the same list. useSearchParams always
  // has the current URL, even when Back reuses an older render of the page.
  const searchParams = useSearchParams();
  const [activeDialog, setActiveDialog] = useState<null | DeleteDialogI>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: PAGE_SIZE,
  });
  const [filterModel, setFilterModel] = useState<GridFilterModel>(() =>
    filterModelFromSearchParams(
      searchParams.getAll('filter'),
      searchParams.get('search')
    )
  );
  // Bumped when a navigation (e.g. the Donors link) changes the URL, so the
  // search box and filter panel start again from the new filters.
  const [urlVersion, setUrlVersion] = useState(0);
  const query = searchParams.toString();
  const [lastQuery, setLastQuery] = useState(query);
  if (query !== lastQuery) {
    setLastQuery(query);
    // The table writes the URL from the model; only follow other changes.
    if (filterModelToSearchParams(filterModel).toString() !== query) {
      setFilterModel(
        filterModelFromSearchParams(
          searchParams.getAll('filter'),
          searchParams.get('search')
        )
      );
      setUrlVersion((version) => version + 1);
    }
  }
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
  const changeFilterModel = setFilterModel;
  const changeSortModel = (sortModel: GridSortModel) => setSortModel(sortModel);

  const values: DonorsContextI = {
    urlVersion,
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
