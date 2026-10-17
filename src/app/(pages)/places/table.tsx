'use client';

import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { IconButton, Stack, TextField } from '@mui/material';
import { debounce } from '@mui/material/utils';
import { MdDelete, MdEdit, MdVisibility } from 'react-icons/md';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePlacesContext } from '@/context/PlacesContext';
import { PlaceListItem } from '@/hooks/usePlaces';
import { ROUTE_PATHS } from '@/routes';
import { PAGE_SIZE } from '@/lib/const';

export default function PlacesTable() {
  const {
    places,
    placeCount,
    isLoading,
    isFetching,
    openDialog,
    filterModel,
    changeFilterModel,
    changePaginationModel,
    changeSortModel,
  } = usePlacesContext();
  const t = useTranslations();

  const columns: GridColDef<PlaceListItem>[] = [
    { field: 'title', headerName: t('fields.title'), flex: 1 },
    { field: 'city', headerName: t('fields.city'), flex: 1 },
    { field: 'address', headerName: t('fields.address'), flex: 1 },
    { field: 'contactName', headerName: t('fields.contactName'), flex: 1 },
    { field: 'phone', headerName: t('fields.phone'), flex: 1 },
    {
      field: 'actionCount',
      headerName: t('fields.actionCount'),
      sortable: false,
      valueGetter: (_, row) => row._count?.actions ?? 0,
    },
    {
      field: 'actions',
      headerName: '',
      disableColumnMenu: true,
      sortable: false,
      filterable: false,
      // Three icon buttons plus the last column's padding.
      minWidth: 160,
      renderCell: (params) => (
        <>
          <Link href={`${ROUTE_PATHS.PROTECTED.PLACES.path}/${params.row.id}`}>
            <IconButton aria-label={t('common.view')}>
              <MdVisibility />
            </IconButton>
          </Link>
          <IconButton
            aria-label={t('common.edit')}
            onClick={() => openDialog({ type: 'update', place: params.row })}
          >
            <MdEdit />
          </IconButton>
          <IconButton
            aria-label={t('common.delete')}
            onClick={() =>
              openDialog({
                type: 'delete',
                place: params.row,
                actionCount: params.row._count?.actions ?? 0,
              })
            }
          >
            <MdDelete />
          </IconButton>
        </>
      ),
    },
  ];

  const searchPlacesDelayed = React.useMemo(
    () =>
      debounce((event: React.ChangeEvent<HTMLInputElement>) => {
        changeFilterModel({
          ...filterModel,
          quickFilterValues: [event.target.value || ''],
        });
      }, 500),
    []
  );

  return (
    <>
      <Stack direction='row' sx={{ mb: 2 }}>
        <TextField
          color='secondary'
          label={t('common.search')}
          placeholder={t('places.searchPlaceholder')}
          variant='standard'
          sx={{ width: { xs: '100%', md: '50%' } }}
          onChange={searchPlacesDelayed}
        />
      </Stack>
      <DataGrid
        // Replaces the theme's initialState, so it repeats the page size.
        initialState={{
          sorting: { sortModel: [{ field: 'title', sort: 'asc' }] },
          pagination: { paginationModel: { pageSize: PAGE_SIZE, page: 0 } },
        }}
        rows={places}
        rowCount={placeCount}
        columns={columns}
        loading={isLoading || isFetching}
        paginationMode='server'
        onPaginationModelChange={changePaginationModel}
        sortingMode='server'
        onSortModelChange={changeSortModel}
      />
    </>
  );
}
