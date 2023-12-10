import { reactQueryKeys } from '@/lib/const';
import { Place } from '@prisma/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const getPlaces = async () => {
  const response = await fetch('/api/places', {
    method: 'GET',
  });
  return (await response.json()) as Place[];
};

const useGetPlaces = () => {
  return useQuery({
    queryKey: reactQueryKeys.places.all(),
    queryFn: () => getPlaces(),
    refetchOnMount: false,
  });
};

const createPlace = async (data: Partial<Place>): Promise<void> => {
  const response = await fetch(`/api/places/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create place.');
  }
};

const useCreatePlace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Place>) => createPlace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.places.all() });
    },
  });
};

const updatePlace = async (data: Partial<Place>): Promise<void> => {
  const response = await fetch(`/api/places/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update place.');
  }
};

const useUpdatePlace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Place>) => updatePlace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.places.all() });
    },
  });
};

const removePlace = async (id: string): Promise<void> => {
  const response = await fetch(`/api/places/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to remove the place.');
  }
};

const useRemovePlace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removePlace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.places.all() });
    },
  });
};

export { useGetPlaces, useCreatePlace, useUpdatePlace, useRemovePlace };
