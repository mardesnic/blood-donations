import { reactQueryKeys } from '@/lib/const';
import { GetParams } from '@/lib/types';
import { Donation } from '@prisma/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DonationWithDonor } from '@/context/DonationsContext';

const getDonations = async (
  { page, pageSize, search, filter, sort }: GetParams,
  donorId?: string
) => {
  const queryParams = new URLSearchParams({
    page: page?.toString() || '1',
    pageSize: pageSize?.toString() || '10',
    search: search || '',
    filter: filter || '',
    sort: sort || '',
    donorId: donorId || '',
  });

  const response = await fetch(`/api/donations?${queryParams}`, {
    method: 'GET',
  });
  return (await response.json()) as {
    donations: DonationWithDonor[];
    count: number;
  };
};

const useGetDonations = (getDonationsParams: GetParams, donorId?: string) => {
  return useQuery({
    queryKey: reactQueryKeys.donations.list(
      getDonationsParams.page,
      getDonationsParams.pageSize,
      getDonationsParams.search || '',
      getDonationsParams.filter || '',
      getDonationsParams.sort || '',
      donorId || ''
    ),
    queryFn: () => getDonations(getDonationsParams, donorId),
  });
};

const createDonation = async (data: Partial<Donation>): Promise<void> => {
  const response = await fetch(`/api/donations/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create donation.');
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
    throw new Error('Failed to update donation.');
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
    throw new Error('Failed to remove the donation.');
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
