'use client';

import {
  useCreatePlace,
  useGetPlaces,
  useRemovePlace,
  useUpdatePlace,
} from '@/hooks/usePlaces';
import { PAGE_SIZE } from '@/lib/const';
import { generateFilterString, generateSortString } from '@/lib/utils';
import {
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { Place } from '@prisma/client';
import React, { createContext, useContext, useState } from 'react';

interface DeleteDialogI {
  type: 'delete';
  place: Place;
}

interface UpdateDialogI {
  type: 'update';
  place: Place;
}

interface CreateDialogI {
  type: 'create';
}

type DialogType = null | DeleteDialogI | UpdateDialogI | CreateDialogI;

interface PlacesContextI {
  places: Place[];
  placeCount: number;
  isLoading: boolean;
  isFetching: boolean;
  activeDialog: DialogType;
  paginationModel: GridPaginationModel;
  filterModel: GridFilterModel;
  sortModel: GridSortModel;
  openDialog: (dialog: DialogType) => void;
  createPlace: (data: Partial<Place>) => Promise<void>;
  updatePlace: (data: Partial<Place>) => Promise<void>;
  removePlace: (id: string) => Promise<void>;
  closeDialog: () => void;
  changePaginationModel: (paginationModel: GridPaginationModel) => void;
  changeFilterModel: (filterModel: GridFilterModel) => void;
  changeSortModel: (sortModel: GridSortModel) => void;
}

const PlacesContext = createContext({} as PlacesContextI);

export const PlacesProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeDialog, setActiveDialog] = useState<null | DialogType>(null);
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
  const { isLoading, isFetching, data } = useGetPlaces({
    ...paginationModel,
    search,
    filter: generateFilterString(filterModel),
    sort: generateSortString(sortModel),
  });
  const { mutateAsync: createPlace, isPending: isCreatePending } =
    useCreatePlace();
  const { mutateAsync: updatePlace, isPending: isUpdatePending } =
    useUpdatePlace();
  const { mutateAsync: removePlace, isPending: isDeletePending } =
    useRemovePlace();
  const closeDialog = () => setActiveDialog(null);
  const openDialog = (dialog: DialogType) => setActiveDialog(dialog);
  const places = data?.places || [];
  const placeCount = data?.count || 0;
  const changePaginationModel = (paginationModel: GridPaginationModel) =>
    setPaginationModel(paginationModel);
  const changeFilterModel = (filterModel: GridFilterModel) =>
    setFilterModel(filterModel);
  const changeSortModel = (sortModel: GridSortModel) => setSortModel(sortModel);

  const values: PlacesContextI = {
    places,
    placeCount,
    isLoading:
      isLoading || isDeletePending || isCreatePending || isUpdatePending,
    isFetching,
    createPlace,
    updatePlace,
    removePlace,
    activeDialog,
    closeDialog,
    openDialog,
    paginationModel,
    changePaginationModel,
    filterModel,
    changeFilterModel,
    sortModel,
    changeSortModel,
  };

  return (
    <PlacesContext.Provider value={values}>{children}</PlacesContext.Provider>
  );
};

export const usePlacesContext = () => {
  const context = useContext(PlacesContext);
  if (context === undefined) {
    throw new Error('usePlacesContext must be used within a PlacesProvider');
  }
  return context;
};
