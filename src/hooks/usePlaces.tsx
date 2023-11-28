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
  });
};

const removePlace = async (id: string): Promise<void> => {
  const response = await fetch(`/api/places/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    alert('Failed to remove the place.');
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

export { useGetPlaces, useRemovePlace };
