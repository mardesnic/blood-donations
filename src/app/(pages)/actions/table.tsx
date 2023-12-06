'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Action } from '@prisma/client';
import { IconButton } from '@mui/material';
import { MdDelete, MdEdit } from 'react-icons/md';
import { useActionsContext } from '@/context/ActionsContext';
import { DATE_TIME_FORMAT } from '@/lib/const';

export default function ActionsTable() {
  const { actions, isLoading, isFetching, openDialog } = useActionsContext();
  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
    },
    {
      field: 'place',
      headerName: 'Place',
      flex: 1,
      renderCell: (params) => params?.value?.title || 'None',
    },
    {
      field: 'startDateTime',
      headerName: 'Start Date',
      flex: 1,
      renderCell: (params) => dayjs(params.value).format(DATE_TIME_FORMAT),
    },
    {
      field: 'endDateTime',
      headerName: 'End Date',
      flex: 1,
      renderCell: (params) => dayjs(params.value).format(DATE_TIME_FORMAT),
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
            onClick={() => openDialog({ type: 'update', action: params.row })}
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
