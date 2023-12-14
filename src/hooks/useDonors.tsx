import { reactQueryKeys } from '@/lib/const';
import { Donor } from '@prisma/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type GetDonorsParams = {
  page: number;
  pageSize: number;
  search?: string;
  filter?: string;
  sort?: string;
};

const getDonors = async ({
  page,
  pageSize,
  search,
  filter,
  sort,
}: GetDonorsParams) => {
  const queryParams = new URLSearchParams({
    page: page?.toString() || '1',
    pageSize: pageSize?.toString() || '10',
    search: search || '',
    filter: filter || '',
    sort: sort || '',
  });
  const response = await fetch(`/api/donors?${queryParams}`, {
    method: 'GET',
  });
  return (await response.json()) as { donors: Donor[]; count: number };
};

const useGetDonors = (getDonorsParams: GetDonorsParams, enabled = true) => {
  return useQuery({
    queryKey: reactQueryKeys.donors.list(
      getDonorsParams.page,
      getDonorsParams.pageSize,
      getDonorsParams.search || '',
      getDonorsParams.filter || '',
      getDonorsParams.sort || ''
    ),
    queryFn: () => getDonors(getDonorsParams),
    enabled,
  });
};

const createDonor = async (data: Partial<Donor>): Promise<void> => {
  const response = await fetch(`/api/donors/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create donor.');
  }
};

const useCreateDonor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Donor>) => createDonor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.donors.all() });
    },
  });
};

const updateDonor = async (data: Partial<Donor>): Promise<void> => {
  const response = await fetch(`/api/donors/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update donor.');
  }
};

const useUpdateDonor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Donor>) => updateDonor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.donors.all() });
    },
  });
};

const removeDonor = async (id: string): Promise<void> => {
  const response = await fetch(`/api/donors/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to remove the donor.');
  }
};

const useRemoveDonor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeDonor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reactQueryKeys.donors.all() });
    },
  });
};

export { useGetDonors, useCreateDonor, useUpdateDonor, useRemoveDonor };
