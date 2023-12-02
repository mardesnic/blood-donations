'use client';

import {
  useCreatePlace,
  useGetPlaces,
  useRemovePlace,
  useUpdatePlace,
} from '@/hooks/usePlaces';
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
  isLoading: boolean;
  isFetching: boolean;
  activeDialog: DialogType;
  openDialog: (dialog: DialogType) => void;
  createPlace: (data: Partial<Place>) => Promise<void>;
  updatePlace: (data: Partial<Place>) => Promise<void>;
  removePlace: (id: string) => Promise<void>;
  closeDialog: () => void;
}

const PlacesContext = createContext({} as PlacesContextI);

export const PlacesProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isFetching, data: places = [] } = useGetPlaces();
  const { mutateAsync: createPlace, isPending: isCreatePending } =
    useCreatePlace();
  const { mutateAsync: updatePlace, isPending: isUpdatePending } =
    useUpdatePlace();
  const { mutateAsync: removePlace, isPending: isDeletePending } =
    useRemovePlace();
  const [activeDialog, setActiveDialog] = useState<null | DialogType>(null);
  const closeDialog = () => setActiveDialog(null);
  const openDialog = (dialog: DialogType) => setActiveDialog(dialog);
  const values: PlacesContextI = {
    places,
    isLoading:
      isLoading ||
      isFetching ||
      isDeletePending ||
      isCreatePending ||
      isUpdatePending,
    isFetching,
    createPlace,
    updatePlace,
    removePlace,
    activeDialog,
    closeDialog,
    openDialog,
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
