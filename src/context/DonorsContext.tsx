'use client';

import {
  useCreateDonor,
  useGetDonors,
  useRemoveDonor,
  useUpdateDonor,
} from '@/hooks/useDonors';
import { Donor } from '@prisma/client';
import React, { createContext, useContext, useState } from 'react';

interface DeleteDialogI {
  type: 'delete';
  donor: Donor;
}

interface UpdateDialogI {
  type: 'update';
  donor: Donor;
}

interface CreateDialogI {
  type: 'create';
}

type DialogType = null | DeleteDialogI | UpdateDialogI | CreateDialogI;

interface DonorsContextI {
  donors: Donor[];
  isLoading: boolean;
  isFetching: boolean;
  activeDialog: DialogType;
  openDialog: (dialog: DialogType) => void;
  createDonor: (data: Partial<Donor>) => Promise<void>;
  updateDonor: (data: Partial<Donor>) => Promise<void>;
  removeDonor: (id: string) => Promise<void>;
  closeDialog: () => void;
}

const DonorsContext = createContext({} as DonorsContextI);

export const DonorsProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isFetching, data: donors = [] } = useGetDonors();
  const { mutateAsync: createDonor, isPending: isCreatePending } =
    useCreateDonor();
  const { mutateAsync: updateDonor, isPending: isUpdatePending } =
    useUpdateDonor();
  const { mutateAsync: removeDonor, isPending: isDeletePending } =
    useRemoveDonor();
  const [activeDialog, setActiveDialog] = useState<null | DialogType>(null);
  const closeDialog = () => setActiveDialog(null);
  const openDialog = (dialog: DialogType) => setActiveDialog(dialog);
  const values: DonorsContextI = {
    donors,
    isLoading:
      isLoading ||
      isFetching ||
      isDeletePending ||
      isCreatePending ||
      isUpdatePending,
    isFetching,
    createDonor,
    updateDonor,
    removeDonor,
    activeDialog,
    closeDialog,
    openDialog,
  };

  return (
    <DonorsContext.Provider value={values}>{children}</DonorsContext.Provider>
  );
};

export const useDonorsContext = () => {
  const context = useContext(DonorsContext);
  if (context === undefined) {
    throw new Error('useDonorsContext must be used within a DonorsProvider');
  }
  return context;
};
