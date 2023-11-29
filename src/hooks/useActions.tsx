import { reactQueryKeys } from '@/lib/const';
import { Action } from '@prisma/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const getActions = async () => {
  const response = await fetch('/api/actions', {
    method: 'GET',
  });
  return (await response.json()) as Action[];
};

const useGetActions = () => {
  return useQuery({
    queryKey: reactQueryKeys.actions.all(),
    queryFn: () => getActions(),
  });
};

const removeAction = async (id: string): Promise<void> => {
  const response = await fetch(`/api/actions/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    alert('Failed to remove the action.');
  }
};

const useRemoveAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.actions.all() });
    },
  });
};

export { useGetActions, useRemoveAction };
