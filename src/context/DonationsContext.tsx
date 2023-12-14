'use client';

import {
  useCreateDonation,
  useGetDonations,
  useRemoveDonation,
  useUpdateDonation,
} from '@/hooks/useDonations';
import { Donation, Prisma } from '@prisma/client';
import React, { createContext, useContext, useState } from 'react';

export type DonationWithDonor = Prisma.DonationGetPayload<{
  include: { donor: true };
}>;

interface DeleteDialogI {
  type: 'delete';
  donation: DonationWithDonor;
}

interface UpdateDialogI {
  type: 'update';
  donation: DonationWithDonor;
}

interface CreateDialogI {
  type: 'create';
}

type DialogType = null | DeleteDialogI | UpdateDialogI | CreateDialogI;

interface DonationsContextI {
  donations: DonationWithDonor[];
  isLoading: boolean;
  isFetching: boolean;
  activeDialog: DialogType;
  openDialog: (dialog: DialogType) => void;
  createDonation: (data: Partial<Donation>) => Promise<void>;
  updateDonation: (data: Partial<Donation>) => Promise<void>;
  removeDonation: (id: string) => Promise<void>;
  closeDialog: () => void;
}

const DonationsContext = createContext({} as DonationsContextI);

export const DonationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isLoading, isFetching, data: donations = [] } = useGetDonations();
  const { mutateAsync: createDonation, isPending: isCreatePending } =
    useCreateDonation();
  const { mutateAsync: updateDonation, isPending: isUpdatePending } =
    useUpdateDonation();
  const { mutateAsync: removeDonation, isPending: isDeletePending } =
    useRemoveDonation();
  const [activeDialog, setActiveDialog] = useState<null | DialogType>(null);
  const closeDialog = () => setActiveDialog(null);
  const openDialog = (dialog: DialogType) => setActiveDialog(dialog);

  const values: DonationsContextI = {
    donations,
    isLoading:
      isLoading ||
      isFetching ||
      isDeletePending ||
      isCreatePending ||
      isUpdatePending,
    isFetching,
    createDonation,
    updateDonation,
    removeDonation,
    activeDialog,
    closeDialog,
    openDialog,
  };

  return (
    <DonationsContext.Provider value={values}>
      {children}
    </DonationsContext.Provider>
  );
};

export const useDonationsContext = () => {
  const context = useContext(DonationsContext);
  if (context === undefined) {
    throw new Error(
      'useDonationsContext must be used within a DonationsProvider'
    );
  }
  return context;
};
