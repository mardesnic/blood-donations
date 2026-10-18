'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Action } from '@/generated/prisma/browser';
import {
  Card,
  IconButton,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { MdDelete, MdEdit } from 'react-icons/md';
import { useActionsContext } from '@/context/ActionsContext';
import { DATE_FORMAT, DATE_TIME_FORMAT, PAGE_SIZE } from '@/lib/const';
import { ROUTE_PATHS } from '@/routes';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { TruncatedText } from '@/components/TruncatedText';

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
  const t = useTranslations();
  const router = useRouter();
  // Phones show title, start date and the buttons; tablets add place and
  // donation count; wider screens also end time and note.
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const columnVisibilityModel = {
    place: !isPhone,
    donationCount: !isPhone,
    endDateTime: !isTablet,
    note: !isTablet,
  };
  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: t('fields.title'),
      flex: 1.5,
      minWidth: isPhone ? 100 : 130,
      renderCell: (params) => <TruncatedText text={params.value} />,
    },
    {
      field: 'place',
      headerName: t('fields.place'),
      flex: 1,
      minWidth: 110,
      renderCell: (params) => (
        <TruncatedText text={params?.value?.title || t('common.none')} />
      ),
    },
    {
      field: 'startDateTime',
      headerName: t('fields.startDate'),
      // Phones show just the day; room for the title and the sort arrow.
      width: isPhone ? 125 : 165,
      renderCell: (params) =>
        dayjs(params.value).format(isPhone ? DATE_FORMAT : DATE_TIME_FORMAT),
    },
    {
      field: 'endDateTime',
      headerName: t('fields.endDate'),
      width: 165,
      renderCell: (params) => dayjs(params.value).format(DATE_TIME_FORMAT),
    },
    {
      field: 'donationCount',
      headerName: t('fields.donations'),
      width: 120,
    },
    {
      field: 'note',
      headerName: t('fields.note'),
      flex: 1,
      minWidth: 150,
      renderCell: (params) => <TruncatedText text={params.value} />,
    },
    {
      field: 'actions',
      headerName: '',
      disableColumnMenu: true,
      sortable: false,
      filterable: false,
      // Two icon buttons plus the table's 24px right padding.
      width: isPhone ? 105 : 130,
      // The row opens the action; these buttons must not.
      renderCell: (params: { row: Action }) => (
        <Stack
          direction='row'
          alignItems='center'
          height='100%'
          onClick={(event) => event.stopPropagation()}
        >
          <IconButton
            size={isPhone ? 'small' : 'medium'}
            aria-label={t('common.edit')}
            onClick={() => openDialog({ type: 'update', action: params.row })}
          >
            <MdEdit />
          </IconButton>
          <IconButton
            size={isPhone ? 'small' : 'medium'}
            aria-label={t('common.delete')}
            onClick={() => openDialog({ type: 'delete', action: params.row })}
          >
            <MdDelete />
          </IconButton>
        </Stack>
      ),
    },
  ];
  return (
    <Card sx={{ mt: 4 }} elevation={2}>
      <DataGrid
        initialState={{
          sorting: {
            sortModel: [{ field: 'startDateTime', sort: 'desc' }],
          },
          pagination: { paginationModel: { pageSize: PAGE_SIZE } },
        }}
        columnVisibilityModel={columnVisibilityModel}
        disableColumnMenu
        rows={actions}
        rowCount={count}
        columns={columns}
        loading={isLoading || isFetching}
        paginationMode='server'
        onPaginationModelChange={changePaginationModel}
        sortingMode='server'
        onSortModelChange={changeSortModel}
        sx={{ border: 0, mt: '24px' }}
        getRowHeight={() => 55}
        onRowClick={(row) =>
          router.push(`${ROUTE_PATHS.PROTECTED.ACTIONS.path}/${row.id}`)
        }
      />
    </Card>
  );
}
