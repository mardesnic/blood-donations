'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Action } from '@prisma/client';
import { IconButton } from '@mui/material';
import { MdDelete, MdEdit, MdVisibility } from 'react-icons/md';
import { useActionsContext } from '@/context/ActionsContext';
import { DATE_TIME_FORMAT } from '@/lib/const';
import { ROUTE_PATHS } from '@/routes';
import Link from 'next/link';

export default function ActionsTable() {
  const {
    actions,
    count,
    isLoading,
    isFetching,
    openDialog,
    changePaginationModel,
    changeSortModel,
  } = useActionsContext();
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
      headerName: '',
      disableColumnMenu: true,
      sortable: false,
      filterable: false,
      minWidth: 135,
      renderCell: (params: { row: Action }) => (
        <>
          <Link href={`${ROUTE_PATHS.PROTECTED.ACTIONS.path}/${params.row.id}`}>
            <IconButton>
              <MdVisibility />
            </IconButton>
          </Link>
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
      initialState={{
        sorting: {
          sortModel: [{ field: 'startDateTime', sort: 'desc' }],
        },
        pagination: { paginationModel: { pageSize: 15 } },
      }}
      rows={actions}
      rowCount={count}
      columns={columns}
      loading={isLoading || isFetching}
      paginationMode='server'
      onPaginationModelChange={changePaginationModel}
      sortingMode='server'
      onSortModelChange={changeSortModel}
    />
  );
}
