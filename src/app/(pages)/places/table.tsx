'use client';

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Place } from '@prisma/client';
import { IconButton, useMediaQuery, useTheme } from '@mui/material';
import { MdDelete, MdEdit, MdVisibility } from 'react-icons/md';
import { usePlacesContext } from '@/context/PlacesContext';
import { ROUTE_PATHS } from '@/routes';

export default function PlacesTable() {
  const { places, isLoading, isFetching, openDialog } = usePlacesContext();
  const theme = useTheme();
  const isMdScreen = useMediaQuery(theme.breakpoints.down('md'));

  const columns: GridColDef[] = [
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
      headerName: 'Actions',
      disableColumnMenu: true,
      hideSortIcons: true,
      minWidth: 135,
      renderCell: (params: { row: Place }) => (
        <>
          <IconButton
            href={`${ROUTE_PATHS.PROTECTED.PLACES.path}/${params.row.id}`}
          >
            <MdVisibility />
          </IconButton>
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
          <IconButton
            href={`${ROUTE_PATHS.PROTECTED.PLACES.path}/${params.row.id}`}
          >
            <MdVisibility />
          </IconButton>
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

  return (
    <DataGrid
      loading={isLoading || isFetching}
      rows={places || []}
      columns={isMdScreen ? mdColumns : columns}
    />
  );
}
