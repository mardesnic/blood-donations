import { reactQueryKeys } from '@/lib/const';
import { Donation } from '@prisma/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const getDonations = async () => {
  const response = await fetch('/api/donations', {
    method: 'GET',
  });
  return (await response.json()) as Donation[];
};

const useGetDonations = () => {
  return useQuery({
    queryKey: reactQueryKeys.donations.all(),
    queryFn: () => getDonations(),
  });
};

const createDonation = async (data: Partial<Donation>): Promise<void> => {
  const response = await fetch(`/api/donations/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    alert('Failed to create donation.');
  }
};

const useCreateDonation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Donation>) => createDonation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.donations.all(),
      });
    },
  });
};

const updateDonation = async (data: Partial<Donation>): Promise<void> => {
  const response = await fetch(`/api/donations/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    alert('Failed to update donation.');
  }
};

const useUpdateDonation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Donation>) => updateDonation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.donations.all(),
      });
    },
  });
};

const removeDonation = async (id: string): Promise<void> => {
  const response = await fetch(`/api/donations/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    alert('Failed to remove the donation.');
  }
};

const useRemoveDonation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeDonation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reactQueryKeys.donations.all(),
      });
    },
  });
};

export {
  useGetDonations,
  useCreateDonation,
  useUpdateDonation,
  useRemoveDonation,
};
