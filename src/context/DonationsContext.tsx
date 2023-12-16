'use client';

import {
  useCreateDonation,
  useGetDonations,
  useRemoveDonation,
  useUpdateDonation,
} from '@/hooks/useDonations';
import { Donation, Donor, Prisma } from '@prisma/client';
import React, { createContext, useContext, useState } from 'react';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { PAGE_SIZE } from '@/lib/const';
import { generateSortString } from '@/lib/utils';

export type DonationWithDonor = Prisma.DonationGetPayload<{
  include: { donor: true; action: true };
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
  count: number;
  isLoading: boolean;
  isFetching: boolean;
  activeDialog: DialogType;
  openDialog: (dialog: DialogType) => void;
  createDonation: (data: Partial<Donation>) => Promise<void>;
  updateDonation: (data: Partial<Donation>) => Promise<void>;
  removeDonation: (id: string) => Promise<void>;
  closeDialog: () => void;
  paginationModel: GridPaginationModel;
  changePaginationModel: (paginationModel: GridPaginationModel) => void;
  sortModel: GridSortModel;
  changeSortModel: (sortModel: GridSortModel) => void;
  donor?: Donor;
}

const DonationsContext = createContext({} as DonationsContextI);

export const DonationsProvider = ({
  children,
  donor,
}: {
  children: React.ReactNode;
  donor?: Donor;
}) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: PAGE_SIZE,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>(
    {} as GridSortModel
  );
  const { isLoading, isFetching, data } = useGetDonations(
    {
      ...paginationModel,
      sort: generateSortString(sortModel),
    },
    donor?.id || ''
  );
  const { mutateAsync: createDonation, isPending: isCreatePending } =
    useCreateDonation();
  const { mutateAsync: updateDonation, isPending: isUpdatePending } =
    useUpdateDonation();
  const { mutateAsync: removeDonation, isPending: isDeletePending } =
    useRemoveDonation();
  const [activeDialog, setActiveDialog] = useState<null | DialogType>(null);
  const closeDialog = () => setActiveDialog(null);
  const openDialog = (dialog: DialogType) => setActiveDialog(dialog);

  const changePaginationModel = (paginationModel: GridPaginationModel) =>
    setPaginationModel(paginationModel);
  const changeSortModel = (sortModel: GridSortModel) => setSortModel(sortModel);

  const values: DonationsContextI = {
    donations: data?.donations || [],
    count: data?.count || 0,
    isLoading:
      isLoading || isDeletePending || isCreatePending || isUpdatePending,
    isFetching,
    createDonation,
    updateDonation,
    removeDonation,
    activeDialog,
    closeDialog,
    openDialog,
    paginationModel,
    changePaginationModel,
    sortModel,
    changeSortModel,
    donor,
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
