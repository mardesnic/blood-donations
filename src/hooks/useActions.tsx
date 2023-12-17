import { reactQueryKeys } from '@/lib/const';
import { Action } from '@prisma/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GetParams } from '@/lib/types';
import { ActionWithPlace } from '@/context/ActionsContext';

const getActions = async (
  { page, pageSize, search, filter, sort }: GetParams,
  placeId?: string
) => {
  const queryParams = new URLSearchParams({
    page: page?.toString() || '1',
    pageSize: pageSize?.toString() || '10',
    search: search || '',
    filter: filter || '',
    sort: sort || '',
    placeId: placeId || '',
  });
  const response = await fetch(`/api/actions?${queryParams}`, {
    method: 'GET',
  });
  return (await response.json()) as {
    actions: ActionWithPlace[];
    count: number;
  };
};

const useGetActions = (getActionsParams: GetParams, placeId?: string) => {
  return useQuery({
    queryKey: reactQueryKeys.actions.list(
      getActionsParams.page,
      getActionsParams.pageSize,
      getActionsParams.search || '',
      getActionsParams.filter || '',
      getActionsParams.sort || '',
      placeId || ''
    ),
    queryFn: () => getActions(getActionsParams, placeId),
  });
};

const createAction = async (data: Partial<Action>): Promise<void> => {
  const response = await fetch(`/api/actions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create action.');
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
    throw new Error('Failed to update action.');
  }
};

const useUpdateAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Action>) => updateAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.actions.all() });
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.donations.all(),
      });
    },
  });
};

const removeAction = async (id: string): Promise<void> => {
  const response = await fetch(`/api/actions/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to remove the action.');
  }
};

const useRemoveAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.actions.all() });
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.donations.all(),
      });
    },
  });
};

export { useGetActions, useCreateAction, useUpdateAction, useRemoveAction };
