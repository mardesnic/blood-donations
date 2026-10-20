'use client';

import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Card,
  IconButton,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { TruncatedText } from '@/components/TruncatedText';
import { debounce } from '@mui/material/utils';
import { MdDelete, MdEdit } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { usePlacesContext } from '@/context/PlacesContext';
import { PlaceListItem } from '@/hooks/usePlaces';
import { ROUTE_PATHS } from '@/routes';
import { PAGE_SIZE } from '@/lib/const';
import { useCurrentUser } from '@/context/CurrentUserContext';

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
  const { isAdmin } = useCurrentUser();
  const router = useRouter();

  // Phones show name, city and the buttons; tablets add contact person and
  // action count; wider screens also address and phone.
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const columnVisibilityModel = {
    address: !isTablet,
    contactName: !isPhone,
    phone: !isTablet,
    actionCount: !isPhone,
  };
  const truncated = {
    renderCell: (params: { value?: string | null }) => (
      <TruncatedText text={params.value} />
    ),
  };
  const columns: GridColDef<PlaceListItem>[] = [
    {
      field: 'title',
      headerName: t('fields.title'),
      flex: 1.5,
      minWidth: isPhone ? 110 : 150,
      ...truncated,
    },
    {
      field: 'city',
      headerName: t('fields.city'),
      flex: 1,
      minWidth: isPhone ? 90 : 120,
      ...truncated,
    },
    {
      field: 'address',
      headerName: t('fields.address'),
      flex: 1,
      minWidth: 140,
      ...truncated,
    },
    {
      field: 'contactName',
      headerName: t('fields.contactName'),
      flex: 1,
      minWidth: 150,
      ...truncated,
    },
    {
      field: 'phone',
      headerName: t('fields.phone'),
      width: 150,
      ...truncated,
    },
    {
      field: 'actionCount',
      headerName: t('fields.actionCount'),
      sortable: false,
      width: 100,
      valueGetter: (_, row) => row._count?.actions ?? 0,
    },
    {
      field: 'actions',
      headerName: '',
      disableColumnMenu: true,
      sortable: false,
      filterable: false,
      // Icon buttons (delete only for admins) plus the table's 24px right
      // padding.
      width: isAdmin ? (isPhone ? 105 : 130) : isPhone ? 65 : 80,
      // The row opens the place; these buttons must not.
      renderCell: (params) => (
        <Stack
          direction='row'
          alignItems='center'
          height='100%'
          onClick={(event) => event.stopPropagation()}
        >
          <IconButton
            size={isPhone ? 'small' : 'medium'}
            aria-label={t('common.edit')}
            onClick={() => openDialog({ type: 'update', place: params.row })}
          >
            <MdEdit />
          </IconButton>
          {/* Only admins delete. */}
          {isAdmin && (
            <IconButton
              size={isPhone ? 'small' : 'medium'}
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
          )}
        </Stack>
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
    <Card sx={{ mt: 4 }} elevation={2}>
      <Stack direction='row' sx={{ p: '30px 24px' }}>
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
        columnVisibilityModel={columnVisibilityModel}
        disableColumnMenu
        rows={places}
        rowCount={placeCount}
        columns={columns}
        loading={isLoading || isFetching}
        paginationMode='server'
        onPaginationModelChange={changePaginationModel}
        sortingMode='server'
        onSortModelChange={changeSortModel}
        sx={{ border: 0 }}
        getRowHeight={() => 55}
        onRowClick={(row) =>
          router.push(`${ROUTE_PATHS.PROTECTED.PLACES.path}/${row.id}`)
        }
      />
    </Card>
  );
}
