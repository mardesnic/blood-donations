import { useMutation, useQuery } from '@tanstack/react-query';
import { BloodType, CommunicationType } from '@/generated/prisma/browser';
import { ContactType } from '@/lib/callList';

// A logged contact as the API returns it (dates as ISO strings).
export interface Contact {
  id: string;
  type: CommunicationType;
  note: string | null;
  createdAt: string;
  createdById: string | null;
  // Who logged it; null for older contacts.
  createdBy: { name: string; email: string } | null;
}

export interface CallListDonor {
  id: string;
  firstName: string;
  lastName: string;
  bloodType: BloodType | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  lastDonation: string | null;
  donationCount: number;
  lastContact: Contact | null;
}

export interface CallListResponse {
  donors: CallListDonor[];
  count: number;
  cities?: string[];
}

export const CALL_LIST_KEY = 'CALL_LIST';
export const contactHistoryKey = (donorId: string) =>
  ['CONTACTS', donorId] as const;

// `params` is the call list's query string, page included.
export function useCallList(params: string) {
  return useQuery({
    queryKey: [CALL_LIST_KEY, params],
    queryFn: async () => {
      const response = await fetch(`/api/call-list?${params}&cities=1`);
      if (!response.ok) {
        throw new Error('Failed to load the call list.');
      }
      return (await response.json()) as CallListResponse;
    },
    // Keeps the old page on screen while the next one loads.
    placeholderData: (previous) => previous,
  });
}

export function useContactHistory(donorId: string) {
  return useQuery({
    queryKey: contactHistoryKey(donorId),
    queryFn: async () => {
      const response = await fetch(`/api/donors/${donorId}/communications`);
      if (!response.ok) {
        throw new Error('Failed to load contacts.');
      }
      return ((await response.json()) as { contacts: Contact[] }).contacts;
    },
  });
}

export function useLogContact() {
  return useMutation({
    mutationFn: async ({
      donorId,
      type,
      note,
    }: {
      donorId: string;
      type: ContactType;
      note: string;
    }) => {
      const response = await fetch(`/api/donors/${donorId}/communications`, {
        method: 'POST',
        body: JSON.stringify({ type, note }),
      });
      if (!response.ok) {
        throw new Error('Failed to save the contact.');
      }
      return (await response.json()) as Contact;
    },
  });
}

export function useDeleteContact() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/communications/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete the contact.');
      }
    },
  });
}
