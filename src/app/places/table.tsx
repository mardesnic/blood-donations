'use client';

import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Place } from '@prisma/client';
import { IconButton } from '@mui/material';
import { MdDelete, MdEdit } from 'react-icons/md';
import { usePlacesContext } from '@/context/PlacesContext';

export default function PlacesTable() {
  const { places, isLoading, isFetching, removePlace } = usePlacesContext();
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
      renderCell: (params: { row: Place }) => (
        <>
          <IconButton onClick={() => console.log(params.row)}>
            <MdEdit />
          </IconButton>
          <IconButton onClick={() => removePlace(params.row.id)}>
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
