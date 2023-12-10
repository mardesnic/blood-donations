'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Donation } from '@prisma/client';
import { IconButton } from '@mui/material';
import { MdDelete, MdEdit, MdVisibility } from 'react-icons/md';
import { useDonationsContext } from '@/context/DonationsContext';
import { DATE_TIME_FORMAT } from '@/lib/const';
import { ROUTE_PATHS } from '@/routes';

export default function DonationsTable() {
  const { donations, isLoading, isFetching, openDialog } =
    useDonationsContext();
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
      minWidth: 135,
      renderCell: (params: { row: Donation }) => (
        <>
          <IconButton
            href={`${ROUTE_PATHS.PROTECTED.DONATIONS.path}/${params.row.id}`}
          >
            <MdVisibility />
          </IconButton>
          <IconButton
            onClick={() => openDialog({ type: 'update', donation: params.row })}
          >
            <MdEdit />
          </IconButton>
          <IconButton
            onClick={() => openDialog({ type: 'delete', donation: params.row })}
          >
            <MdDelete />
          </IconButton>
        </>
      ),
    },
  ];
  return (
    <DataGrid
      rows={donations}
      columns={columns}
      loading={isLoading || isFetching}
    />
  );
}
