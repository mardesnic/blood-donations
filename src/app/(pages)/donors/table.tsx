'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Donor } from '@prisma/client';
import { IconButton, useMediaQuery } from '@mui/material';
import { MdDelete, MdEdit, MdVisibility } from 'react-icons/md';
import { useDonorsContext } from '@/context/DonorsContext';
import { DATE_FORMAT } from '@/lib/const';
import { ROUTE_PATHS } from '@/routes';
import { theme } from '@/lib/theme/theme';

export default function DonorsTable() {
  const { donors, isLoading, isFetching, openDialog } = useDonorsContext();
  const isMdScreen = useMediaQuery(theme.breakpoints.down('md'));
  const columns: GridColDef[] = [
    {
      field: 'firstName',
      headerName: 'First Name',
      flex: 1,
    },
    {
      field: 'lastName',
      headerName: 'Last Name',
      flex: 1,
    },
    {
      field: 'city',
      headerName: 'City',
      flex: 1,
    },
    {
      field: 'gender',
      headerName: 'Gender',
      flex: 1,
    },
    {
      field: 'bloodType',
      headerName: 'Blood Type',
      flex: 1,
    },
    {
      field: 'donationCount',
      headerName: 'Donations',
      flex: 1,
    },
    {
      field: 'lastDonation',
      headerName: 'Last Donation',
      flex: 1,
      renderCell: (params) => dayjs(params.value).format(DATE_FORMAT),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      disableColumnMenu: true,
      hideSortIcons: true,
      minWidth: 135,
      renderCell: (params: { row: Donor }) => (
        <>
          <IconButton
            href={`${ROUTE_PATHS.PROTECTED.DONORS.path}/${params.row.id}`}
          >
            <MdVisibility />
          </IconButton>
          <IconButton
            onClick={() => openDialog({ type: 'update', donor: params.row })}
          >
            <MdEdit />
          </IconButton>
          <IconButton
            onClick={() => openDialog({ type: 'delete', donor: params.row })}
          >
            <MdDelete />
          </IconButton>
        </>
      ),
    },
  ];

  const mdColumns: GridColDef[] = [
    {
      field: 'firstName',
      headerName: 'First Name',
      flex: 1,
    },
    {
      field: 'lastName',
      headerName: 'Last Name',
      flex: 1,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      disableColumnMenu: true,
      hideSortIcons: true,
      minWidth: 135,
      renderCell: (params: { row: Donor }) => (
        <>
          <IconButton
            href={`${ROUTE_PATHS.PROTECTED.DONORS.path}/${params.row.id}`}
          >
            <MdVisibility />
          </IconButton>
          <IconButton
            onClick={() => openDialog({ type: 'update', donor: params.row })}
          >
            <MdEdit />
          </IconButton>
          <IconButton
            onClick={() => openDialog({ type: 'delete', donor: params.row })}
          >
            <MdDelete />
          </IconButton>
        </>
      ),
    },
  ];
  return (
    <DataGrid
      rows={donors}
      columns={isMdScreen ? mdColumns : columns}
      loading={isLoading || isFetching}
    />
  );
}
