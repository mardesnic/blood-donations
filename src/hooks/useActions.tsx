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

const createAction = async (data: Partial<Action>): Promise<void> => {
  const response = await fetch(`/api/actions/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    alert('Failed to create action.');
  }
};

const useCreateAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Action>) => createAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.actions.all() });
    },
  });
};

const updateAction = async (data: Partial<Action>): Promise<void> => {
  const response = await fetch(`/api/actions/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    alert('Failed to update action.');
  }
};

const useUpdateAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Action>) => updateAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.actions.all() });
    },
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

export { useGetActions, useCreateAction, useUpdateAction, useRemoveAction };
