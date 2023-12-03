'use client';

import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Action } from '@prisma/client';
import { IconButton } from '@mui/material';
import { MdDelete, MdEdit } from 'react-icons/md';
import { useActionsContext } from '@/context/ActionsContext';

export default function ActionsTable() {
  const { actions, isLoading, isFetching, openDialog } = useActionsContext();
  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
    },
    {
      field: 'startDateTime',
      headerName: 'Start Date',
      flex: 1,
    },
    {
      field: 'endDateTime',
      headerName: 'End Date',
      flex: 1,
    },
    {
      field: 'donationCount',
      headerName: 'Donation Count',
      flex: 1,
    },
    {
      field: 'note',
      headerName: 'Note',
      flex: 1,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      disableColumnMenu: true,
      hideSortIcons: true,
      renderCell: (params: { row: Action }) => (
        <>
          <IconButton
            onClick={() => {
              console.log('edit action ', params);
            }}
          >
            <MdEdit />
          </IconButton>
          <IconButton
            onClick={() => openDialog({ type: 'delete', action: params.row })}
          >
            <MdDelete />
          </IconButton>
        </>
      ),
    },
  ];
  return (
    <DataGrid
      rows={actions}
      columns={columns}
      loading={isLoading || isFetching}
    />
  );
}
