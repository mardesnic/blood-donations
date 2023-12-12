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
      field: 'donationDate',
      headerName: 'Donation Date',
      flex: 1,
      renderCell: (params) => dayjs(params.value).format(DATE_TIME_FORMAT),
    },
    {
      field: 'donor',
      headerName: 'Donor',
      flex: 1,
      renderCell: (params) => params.value.fullName,
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1,
      renderCell: (params) => params.value.title || 'None',
    },
    {
      field: 'denied',
      headerName: 'Denied',
      flex: 1,
      renderCell: (params) => {
        if (!params.value) {
          return '-';
        }

        return params?.row?.denyReason;
      },
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
      initialState={{
        sorting: {
          sortModel: [{ field: 'donationDate', sort: 'desc' }],
        },
      }}
      rows={donations}
      columns={columns}
      loading={isLoading || isFetching}
    />
  );
}
