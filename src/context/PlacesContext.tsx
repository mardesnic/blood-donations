'use client';

import { useGetPlaces, useRemovePlace } from '@/hooks/usePlaces';
import { Place } from '@prisma/client';
import React, { createContext, useContext } from 'react';

interface PlacesContextI {
  places: Place[];
  isLoading: boolean;
  isFetching: boolean;
  removePlace: (id: string) => void;
}

const PlacesContext = createContext({} as PlacesContextI);

export const PlacesProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isFetching, data: places = [] } = useGetPlaces();
  const { mutateAsync: removePlace } = useRemovePlace();
  const values: PlacesContextI = {
    places,
    isLoading,
    isFetching,
    removePlace,
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
