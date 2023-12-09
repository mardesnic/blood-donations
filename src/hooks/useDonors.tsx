import { reactQueryKeys } from '@/lib/const';
import { Donor } from '@prisma/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const getDonors = async () => {
  const response = await fetch('/api/donors', {
    method: 'GET',
  });
  return (await response.json()) as Donor[];
};

const useGetDonors = () => {
  return useQuery({
    queryKey: reactQueryKeys.donors.all(),
    queryFn: () => getDonors(),
  });
};

const createDonor = async (data: Partial<Donor>): Promise<void> => {
  const response = await fetch(`/api/donors/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    alert('Failed to create donor.');
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
    alert('Failed to update donor.');
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
    alert('Failed to remove the donor.');
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
