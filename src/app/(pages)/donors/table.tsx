'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Donor } from '@prisma/client';
import { Button } from '@mui/material';
import { useDonorsContext } from '@/context/DonorsContext';
import { DATE_FORMAT, BLOOD_TYPES, GENDERS } from '@/lib/const';
import { ROUTE_PATHS } from '@/routes';
import Link from 'next/link';

export default function DonorsTable() {
  const {
    donors,
    donorCount,
    changePaginationModel,
    changeFilterModel,
    filterModel,
    changeSortModel,
    isLoading,
    // openDialog,
    // exportDonorsDownloadLink,
  } = useDonorsContext();
  const columns: GridColDef[] = [
    {
      field: 'fullName',
      headerName: 'Name',
      flex: 1,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      flex: 1,
      sortable: false,
    },
    {
      field: 'oib',
      headerName: 'OIB',
      flex: 1,
      sortable: false,
    },
    {
      field: 'bloodType',
      headerName: 'Blood Type',
      flex: 1,
      valueGetter: (params: { value: keyof typeof BLOOD_TYPES }) =>
        BLOOD_TYPES[params.value],
    },
    {
      field: 'donationCount',
      headerName: 'Donations',
      flex: 1,
    },
    {
      field: 'lastDonation',
      headerName: 'Last Donation',
      flex: 1,
      renderCell: (params) => dayjs(params.value).format(DATE_FORMAT),
      valueGetter: ({ value }) => value && new Date(value),
      type: 'date',
    },
    {
      field: 'gender',
      headerName: 'Gender',
      flex: 1,
      valueGetter: (params: { value: keyof typeof GENDERS }) =>
        GENDERS[params.value],
    },

    {
      field: 'dob',
      headerName: 'Date of Birth',
      flex: 1,
      renderCell: (params) => dayjs(params.value).format(DATE_FORMAT),
      valueGetter: ({ value }) => value && new Date(value),
      type: 'date',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      disableColumnMenu: true,
      sortable: false,
      minWidth: 200,
      renderCell: (params: { row: Donor }) => (
        <Link
          href={`${ROUTE_PATHS.PROTECTED.DONORS.path}/${params.row.id}/donations`}
        >
          <Button
            variant='outlined'
            size='medium'
            color='inherit'
            sx={{ width: '190px' }}
          >
            See Donations ({params.row.donationCount})
          </Button>
        </Link>
      ),
    },
  ];
  //
  // columns.forEach(
  //   (column) =>
  //     (column.filterOperators = getEnabledGridFilterOperators(column.type))
  // );

  return (
    <Card sx={{ mt: '30px', p: '30px 24px' }} raised={true}>
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <TextField
          color='secondary'
          label='Search'
          placeholder='Name, email, etc...'
          variant='standard'
          sx={{ width: '50%' }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            changeFilterModel({
              ...filterModel,
              quickFilterValues: [event.target.value || ''],
            });
          }}
        />
        <Button variant='outlined' size='medium' color='inherit'>
          Filter
        </Button>
      </Stack>
      <DataGrid
        rows={donors}
        rowCount={donorCount}
        columns={columns}
        loading={isLoading}
        paginationMode='server'
        onPaginationModelChange={changePaginationModel}
        // filterMode='server'
        // onFilterModelChange={changeFilterModel}
        sortingMode='server'
        onSortModelChange={changeSortModel}
        // slots={{
        //   toolbar: (props) => (
        //     <CustomDataGridToolbar
        //       {...props}
        //       exportLink={exportDonorsDownloadLink}
        //     />
        //   ),
        // }}
        filterDebounceMs={500}
        localeText={{
          toolbarQuickFilterPlaceholder: 'Search by name, city, email, oib',
        }}
        sx={{ border: 0, mt: '24px' }}
        getRowHeight={() => 55}
        disableColumnFilter={true}
      />
    </Card>
  );
}
