'use client';

import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Place } from '@prisma/client';
import { IconButton } from '@mui/material';
import { MdDelete, MdEdit } from 'react-icons/md';
import { usePlacesContext } from '@/context/PlacesContext';

export default function PlacesTable() {
  const { places, isLoading, isFetching, openDialog } = usePlacesContext();
  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Title',
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
      field: 'email',
      headerName: 'Email',
      flex: 1,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      flex: 1,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      disableColumnMenu: true,
      hideSortIcons: true,
      renderCell: (params: { row: Place }) => (
        <>
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
      columns={columns}
    />
  );
}
