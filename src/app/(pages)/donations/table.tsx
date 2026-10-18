'use client';

import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Card,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { TruncatedText } from '@/components/TruncatedText';
import { useDonationsContext } from '@/context/DonationsContext';
import { useRouter } from 'next/navigation';
import { ROUTE_PATHS } from '@/routes';
import { GoDotFill } from 'react-icons/go';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/lib/const';
import { useTranslations } from 'next-intl';

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
    donor,
  } = useDonationsContext();
  const t = useTranslations();
  // Phones show donor (or, on a donor's page, action), date and status, with
  // the deny reason under the status; tablets add action and reason; wider
  // screens also show the note.
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const columnVisibilityModel = {
    // On a donor's page every row is that donor.
    donor: !donor,
    action: !isPhone || !!donor,
    denyReason: !isPhone,
    note: !isTablet,
  };
  const status = (denied: boolean, denyReason: string | null) => (
    <Stack justifyContent='center' height='100%'>
      <Stack direction='row' alignItems='center' gap={0.5}>
        <GoDotFill
          color={
            denied ? theme.palette.primary.main : theme.palette.success.main
          }
        />
        <span>{t(denied ? 'donations.denied' : 'donations.completed')}</span>
      </Stack>
      {isPhone && denied && denyReason && (
        <Typography variant='caption' color='text.secondary' sx={{ pl: 2 }}>
          {t(`denyReasons.${denyReason}`)}
        </Typography>
      )}
    </Stack>
  );
  const columns: GridColDef[] = [
    {
      field: 'donor',
      headerName: t('fields.donor'),
      sortable: true,
      disableColumnMenu: true,
      flex: 1.5,
      minWidth: isPhone ? 120 : 140,
      renderCell: (params) => <TruncatedText text={params?.value?.fullName} />,
    },
    {
      field: 'donationDate',
      headerName: t('fields.date'),
      sortable: true,
      // Room for the title and the sort arrow (and, as the first column on
      // a donor's page, the table's left padding).
      width: isPhone && !donor ? 115 : 125,
      renderCell: (params) => dayjs(params.value).format(DATE_FORMAT),
      valueGetter: (value) => value && new Date(value),
      type: 'date',
      disableColumnMenu: true,
    },
    {
      field: 'action',
      headerName: t('fields.action'),
      disableColumnMenu: true,
      sortable: false,
      flex: 1,
      minWidth: isPhone ? 95 : 120,
      renderCell: (params) => (
        <TruncatedText text={params?.value?.title || t('common.none')} />
      ),
    },
    {
      field: 'denied',
      headerName: t('fields.status'),
      disableColumnMenu: true,
      sortable: false,
      width: isPhone ? 105 : 130,
      renderCell: (params) => status(params.value, params.row.denyReason),
    },
    {
      field: 'denyReason',
      headerName: t('fields.reason'),
      disableColumnMenu: true,
      sortable: false,
      width: 120,
      renderCell: (params) =>
        params.value ? t(`denyReasons.${params.value}`) : '',
    },
    {
      field: 'note',
      headerName: t('fields.note'),
      disableColumnMenu: true,
      sortable: false,
      flex: 1.5,
      minWidth: 160,
      renderCell: (params) => <TruncatedText text={params.value} />,
    },
  ];
  return (
    <Card sx={{ mt: 4 }} elevation={2}>
      <DataGrid
        columnVisibilityModel={columnVisibilityModel}
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
