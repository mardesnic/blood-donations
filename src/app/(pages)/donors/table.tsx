'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Donor } from '@prisma/client';
import { IconButton, useMediaQuery } from '@mui/material';
import { MdDelete, MdEdit, MdVisibility } from 'react-icons/md';
import { useDonorsContext } from '@/context/DonorsContext';
import { DATE_FORMAT } from '@/lib/const';
import { ROUTE_PATHS } from '@/routes';
import { theme } from '@/lib/theme/theme';

export default function DonorsTable() {
  const {
    donors,
    donorCount,
    changePaginationModel,
    changeFilterModel,
    isLoading,
    openDialog,
  } = useDonorsContext();
  const isMdScreen = useMediaQuery(theme.breakpoints.down('md'));
  const columns: GridColDef[] = [
    {
      field: 'fullName',
      headerName: 'Name',
      flex: 2,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 2,
    },
    {
      field: 'oib',
      headerName: 'OIB',
      flex: 2,
    },
    {
      field: 'city',
      headerName: 'City',
      flex: 2,
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
      type: 'number',
    },
    {
      field: 'lastDonation',
      headerName: 'Last Donation',
      flex: 1,
      renderCell: (params) => dayjs(params.value).format(DATE_FORMAT),
      valueGetter: ({ value }) => value && new Date(value),
      type: 'date',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      disableColumnMenu: true,
      hideSortIcons: true,
      filterable: false,
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
      field: 'fullName',
      headerName: 'Name',
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
      rowCount={donorCount}
      columns={isMdScreen ? mdColumns : columns}
      loading={isLoading}
      paginationMode='server'
      onPaginationModelChange={changePaginationModel}
      filterMode='server'
      onFilterModelChange={changeFilterModel}
      disableColumnFilter={false}
      slots={{ toolbar: GridToolbar }}
      filterDebounceMs={500}
      localeText={{
        toolbarQuickFilterPlaceholder: 'Search by name, city, email, oib',
      }}
    />
  );
}
