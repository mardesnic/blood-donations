import { reactQueryKeys } from '@/lib/const';
import { GetParams } from '@/lib/types';
import { Place, Prisma } from '@/generated/prisma/browser';

// A place as the list API returns it, with how many actions use it.
export type PlaceListItem = Prisma.PlaceGetPayload<{
  include: { _count: { select: { actions: true } } };
}>;
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const getPlaces = async ({
  page,
  pageSize,
  search,
  filter,
  sort,
}: GetParams) => {
  const queryParams = new URLSearchParams({
    page: page?.toString() || '1',
    pageSize: pageSize?.toString() || '10',
    search: search || '',
    filter: filter || '',
    sort: sort || '',
  });
  const response = await fetch(`/api/places?${queryParams}`, {
    method: 'GET',
  });
  return (await response.json()) as {
    places: PlaceListItem[];
    count: number;
  };
};

const useGetPlaces = (getPlacesParams: GetParams, enabled = true) => {
  return useQuery({
    queryKey: reactQueryKeys.places.list(
      getPlacesParams.page,
      getPlacesParams.pageSize,
      getPlacesParams.search || '',
      getPlacesParams.filter || '',
      getPlacesParams.sort || ''
    ),
    queryFn: () => getPlaces(getPlacesParams),
    enabled,
  });
};

// Returns the new place, so a form can select it right away.
const createPlace = async (data: Partial<Place>): Promise<Place> => {
  const response = await fetch(`/api/places/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create place.');
  }
  return (await response.json()) as Place;
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
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.actions.all(),
      });
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
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.actions.all(),
      });
    },
  });
};

export { useGetPlaces, useCreatePlace, useUpdatePlace, useRemovePlace };
