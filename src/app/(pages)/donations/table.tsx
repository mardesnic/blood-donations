'use client';

import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Card } from '@mui/material';
import { useDonationsContext } from '@/context/DonationsContext';
import { useRouter } from 'next/navigation';
import { ROUTE_PATHS } from '@/routes';

export default function DonationsTable() {
  const router = useRouter();
  const {
    donations,
    count,
    isLoading,
    isFetching,
    changePaginationModel,
    changeSortModel,
  } = useDonationsContext();
  const columns: GridColDef[] = [
    {
      field: 'donor',
      headerName: 'Donor',
      sortable: false,
      disableColumnMenu: true,
      flex: 1,
      renderCell: (params) => params?.value?.fullName || '',
    },
    {
      field: 'donationDate',
      headerName: 'Donation Date',
      sortable: false,
      flex: 1,
    },
    {
      field: 'action',
      headerName: 'Action',
      sortable: false,
      disableColumnMenu: true,
      flex: 1,
      renderCell: (params) => params?.value?.title || 'None',
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
  ];
  return (
    <Card sx={{ mt: '30px', p: '30px 24px' }} raised={true}>
      <DataGrid
        rows={donations}
        rowCount={count}
        columns={columns}
        paginationMode='server'
        onPaginationModelChange={changePaginationModel}
        sortingMode='server'
        onSortModelChange={changeSortModel}
        initialState={{
          sorting: {
            sortModel: [{ field: 'donationDate', sort: 'desc' }],
          },
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        loading={isLoading || isFetching}
        filterDebounceMs={500}
        sx={{ border: 0, mt: '24px' }}
        getRowHeight={() => 55}
        disableColumnFilter={true}
        onRowClick={(row) =>
          router.push(`${ROUTE_PATHS.PROTECTED.DONATIONS.path}/${row.id}`)
        }
      />
    </Card>
  );
}
