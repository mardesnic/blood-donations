'use client';

import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Card, Stack, useTheme } from '@mui/material';
import { useDonationsContext } from '@/context/DonationsContext';
import { useRouter } from 'next/navigation';
import { ROUTE_PATHS } from '@/routes';
import { GoDotFill } from 'react-icons/go';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/lib/const';
import { getDenyReasonDescription } from '@/lib/utils';

export default function DonationsTable() {
  const theme = useTheme();
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
      headerName: 'Date',
      sortable: false,
      flex: 1,
      renderCell: (params) => dayjs(params.value).format(DATE_FORMAT),
      valueGetter: ({ value }) => value && new Date(value),
      type: 'date',
      disableColumnMenu: true,
    },
    {
      field: 'action',
      headerName: 'Action',
      disableColumnMenu: true,
      sortable: false,
      flex: 1,
      renderCell: (params) => params?.value?.title || 'None',
    },
    {
      field: 'denied',
      headerName: 'Status',
      disableColumnMenu: true,
      sortable: false,
      flex: 1,
      renderCell: (params) => {
        if (params.value) {
          return (
            <Stack direction='row' alignItems='center' gap={0.5}>
              <GoDotFill color={theme.palette.primary.main} />
              <span>Denied</span>
            </Stack>
          );
        }
        return (
          <Stack direction='row' alignItems='center' gap={0.5}>
            <GoDotFill color={theme.palette.success.main} />
            <span>Completed</span>
          </Stack>
        );
      },
    },
    {
      field: 'denyReason',
      headerName: 'Reason',
      disableColumnMenu: true,
      sortable: false,
      flex: 1,
      renderCell: (params) => getDenyReasonDescription(params.value),
    },
  ];
  return (
    <Card sx={{ mt: 4 }} elevation={2}>
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
