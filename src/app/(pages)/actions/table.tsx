'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Action } from '@/generated/prisma/browser';
import { IconButton } from '@mui/material';
import { MdDelete, MdEdit, MdVisibility } from 'react-icons/md';
import { useActionsContext } from '@/context/ActionsContext';
import { DATE_TIME_FORMAT } from '@/lib/const';
import { ROUTE_PATHS } from '@/routes';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

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
  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: t('fields.title'),
      flex: 1,
    },
    {
      field: 'place',
      headerName: t('fields.place'),
      flex: 1,
      renderCell: (params) => params?.value?.title || t('common.none'),
    },
    {
      field: 'startDateTime',
      headerName: t('fields.startDate'),
      flex: 1,
      renderCell: (params) => dayjs(params.value).format(DATE_TIME_FORMAT),
    },
    {
      field: 'endDateTime',
      headerName: t('fields.endDate'),
      flex: 1,
      renderCell: (params) => dayjs(params.value).format(DATE_TIME_FORMAT),
    },
    {
      field: 'donationCount',
      headerName: t('fields.donationCount'),
      flex: 1,
    },
    {
      field: 'note',
      headerName: t('fields.note'),
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
            <IconButton aria-label={t('common.view')}>
              <MdVisibility />
            </IconButton>
          </Link>
          <IconButton
            aria-label={t('common.edit')}
            onClick={() => openDialog({ type: 'update', action: params.row })}
          >
            <MdEdit />
          </IconButton>
          <IconButton
            aria-label={t('common.delete')}
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
