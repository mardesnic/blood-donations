'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { BloodType, Donor, Gender } from '@prisma/client';
import { IconButton, useMediaQuery } from '@mui/material';
import { MdDelete, MdEdit, MdVisibility } from 'react-icons/md';
import { useDonorsContext } from '@/context/DonorsContext';
import { DATE_FORMAT } from '@/lib/const';
import { ROUTE_PATHS } from '@/routes';
import { theme } from '@/lib/theme/theme';
import { getEnabledGridFilterOperators } from '@/lib/clientUtils';

export default function DonorsTable() {
  const {
    donors,
    donorCount,
    changePaginationModel,
    changeFilterModel,
    changeSortModel,
    isLoading,
    openDialog,
  } = useDonorsContext();
  const isMdScreen = useMediaQuery(theme.breakpoints.down('md'));
  const lgColumns: GridColDef[] = [
    {
      field: 'fullName',
      headerName: 'Name',
      flex: 1,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
    },
    {
      field: 'oib',
      headerName: 'OIB',
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
      type: 'singleSelect',
      valueOptions: Object.values(Gender),
    },
    {
      field: 'bloodType',
      headerName: 'Blood Type',
      flex: 1,
      type: 'singleSelect',
      valueOptions: Object.values(BloodType),
    },
    {
      field: 'donationCount',
      headerName: 'Donations',
      flex: 1,
      type: 'number',
      valueGetter: ({ row }) => row.donationCount,
      renderCell: (params: {
        row: Donor & { _count: { donations: number } };
      }) => (
        <>
          {params.row.donationCount} ({params.row['_count'].donations})
        </>
      ),
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
      field: 'dob',
      headerName: 'Date of Birth',
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
  const columns = isMdScreen ? mdColumns : lgColumns;

  columns.forEach(
    (column) =>
      (column.filterOperators = getEnabledGridFilterOperators(column.type))
  );

  return (
    <DataGrid
      rows={donors}
      rowCount={donorCount}
      columns={columns}
      loading={isLoading}
      paginationMode='server'
      onPaginationModelChange={changePaginationModel}
      filterMode='server'
      onFilterModelChange={changeFilterModel}
      sortingMode='server'
      onSortModelChange={changeSortModel}
      disableColumnFilter={false}
      slots={{ toolbar: GridToolbar }}
      filterDebounceMs={500}
      localeText={{
        toolbarQuickFilterPlaceholder: 'Search by name, city, email, oib',
      }}
    />
  );
}
