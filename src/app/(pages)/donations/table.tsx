'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import { MdDelete, MdEdit, MdVisibility } from 'react-icons/md';
import {
  useDonationsContext,
  DonationWithDonor,
} from '@/context/DonationsContext';
import { DATE_TIME_FORMAT } from '@/lib/const';
import { ROUTE_PATHS } from '@/routes';
import Link from 'next/link';

export default function DonationsTable() {
  const {
    donations,
    count,
    isLoading,
    isFetching,
    openDialog,
    changePaginationModel,
    changeSortModel,
  } = useDonationsContext();
  const columns: GridColDef[] = [
    {
      field: 'donationDate',
      headerName: 'Donation Date',
      sortingOrder: ['desc', 'asc'],
      flex: 1,
      renderCell: (params) => dayjs(params.value).format(DATE_TIME_FORMAT),
    },
    {
      field: 'donor',
      headerName: 'Donor',
      sortable: false,
      disableColumnMenu: true,
      flex: 1,
      renderCell: (params) => params.value.fullName,
    },
    {
      field: 'action',
      headerName: 'Action',
      sortable: false,
      disableColumnMenu: true,
      flex: 1,
      renderCell: (params) => params.value.title || 'None',
    },
    {
      field: 'denied',
      headerName: 'Denied',
      sortable: false,
      disableColumnMenu: true,
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
      sortable: false,
      disableColumnMenu: true,
      flex: 1,
    },
    {
      field: 'actions',
      headerName: '',
      disableColumnMenu: true,
      sortable: false,
      filterable: false,
      minWidth: 135,
      renderCell: (params: { row: DonationWithDonor }) => (
        <>
          <Link
            href={`${ROUTE_PATHS.PROTECTED.DONATIONS.path}/${params.row.id}`}
          >
            <IconButton>
              <MdVisibility />
            </IconButton>
          </Link>
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
        pagination: { paginationModel: { pageSize: 15 } },
      }}
      rows={donations}
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
