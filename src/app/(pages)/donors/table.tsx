'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Donor } from '@prisma/client';
import { Button, Typography } from '@mui/material';
import Link from 'next/link';
import { MdAdd } from 'react-icons/md';

import { DATE_FORMAT, BLOOD_TYPES, GENDERS } from '@/lib/const';
import { ROUTE_PATHS } from '@/routes';
import { useDonorsContext } from '@/context/DonorsContext';
import { useRouter } from 'next/navigation';

export default function DonorsTable() {
  const router = useRouter();

  const {
    donors,
    donorCount,
    changePaginationModel,
    changeFilterModel,
    filterModel,
    changeSortModel,
    isLoading,
    exportDonorsDownloadLink,
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
      disableColumnMenu: true,
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
      flex: 0,
      valueGetter: (params: { value: keyof typeof GENDERS }) =>
        GENDERS[params.value].short,
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

  return (
    <>
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Typography variant='h1'>Donors</Typography>
        <Stack direction='row' gap={2}>
          <Button
            variant='outlined'
            size='medium'
            color='inherit'
            href={exportDonorsDownloadLink}
            target='_blank'
          >
            Export CSV
          </Button>
          <Link href={`${ROUTE_PATHS.PROTECTED.DONORS.path}/create`}>
            <Button color='secondary' size='medium' startIcon={<MdAdd />}>
              New Donor
            </Button>
          </Link>
        </Stack>
      </Stack>
      <Card sx={{ mt: 4 }} elevation={2}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          sx={{ p: '30px 24px' }}
        >
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
          filterDebounceMs={500}
          sx={{ border: 0, mt: '24px' }}
          getRowHeight={() => 55}
          disableColumnFilter={true}
          onRowClick={(row) =>
            router.push(`${ROUTE_PATHS.PROTECTED.DONORS.path}/${row.id}`)
          }
        />
      </Card>
    </>
  );
}
