'use client';

import * as React from 'react';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Place } from '@prisma/client';
import { IconButton, useMediaQuery } from '@mui/material';
import { MdDelete, MdEdit, MdVisibility } from 'react-icons/md';
import { usePlacesContext } from '@/context/PlacesContext';
import { ROUTE_PATHS } from '@/routes';
import { theme } from '@/lib/theme/theme';
import { getEnabledGridFilterOperators } from '@/lib/clientUtils';
import Link from 'next/link';

export default function PlacesTable() {
  const {
    places,
    placeCount,
    changePaginationModel,
    changeFilterModel,
    changeSortModel,
    isLoading,
    openDialog,
  } = usePlacesContext();
  const isMdScreen = useMediaQuery(theme.breakpoints.down('md'));

  const lgColumns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
    },
    {
      field: 'city',
      headerName: 'City',
      flex: 1,
    },
    {
      field: 'address',
      headerName: 'Address',
      flex: 1,
    },
    {
      field: 'contactName',
      headerName: 'Contact',
      flex: 1,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      flex: 1,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
    },
    {
      field: 'actions',
      headerName: '',
      disableColumnMenu: true,
      filterable: false,
      sortable: false,
      minWidth: 135,
      renderCell: (params: { row: Place }) => (
        <>
          <Link href={`${ROUTE_PATHS.PROTECTED.PLACES.path}/${params.row.id}`}>
            <IconButton>
              <MdVisibility />
            </IconButton>
          </Link>
          <IconButton
            onClick={() => openDialog({ type: 'update', place: params.row })}
          >
            <MdEdit />
          </IconButton>
          <IconButton
            onClick={() => openDialog({ type: 'delete', place: params.row })}
          >
            <MdDelete />
          </IconButton>
        </>
      ),
    },
  ];

  const mdColumns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      disableColumnMenu: true,
      hideSortIcons: true,
      minWidth: 135,
      renderCell: (params: { row: Place }) => (
        <>
          <Link href={`${ROUTE_PATHS.PROTECTED.PLACES.path}/${params.row.id}`}>
            <IconButton>
              <MdVisibility />
            </IconButton>
          </Link>

          <IconButton
            onClick={() => openDialog({ type: 'update', place: params.row })}
          >
            <MdEdit />
          </IconButton>
          <IconButton
            onClick={() => openDialog({ type: 'delete', place: params.row })}
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
      rows={places}
      rowCount={placeCount}
      columns={columns}
      loading={isLoading}
      paginationMode='server'
      onPaginationModelChange={changePaginationModel}
      filterMode='server'
      onFilterModelChange={changeFilterModel}
      sortingMode='server'
      onSortModelChange={changeSortModel}
      disableColumnFilter={true}
      slots={{ toolbar: GridToolbar }}
      filterDebounceMs={500}
      localeText={{
        toolbarQuickFilterPlaceholder: 'Search by title, city, contact',
      }}
    />
  );
}
