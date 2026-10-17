'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Donor } from '@/generated/prisma/browser';
import { Button, Tooltip, Typography } from '@mui/material';
import Link from 'next/link';
import { MdAdd } from 'react-icons/md';

import { BLOOD_TYPES, GENDERS } from '@/lib/const';
import { useTranslations } from 'next-intl';
import { formatDay } from '@/lib/dates';
import { eligibilityLabel, eligibilityReason } from '@/lib/eligibility';
import { DonorListItem } from '@/hooks/useDonors';
import { ROUTE_PATHS } from '@/routes';
import { useDonorsContext } from '@/context/DonorsContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DonorsFilters } from '@/app/(pages)/donors/filters';
import { debounce } from '@mui/material/utils';

export default function DonorsTable() {
  const router = useRouter();
  const t = useTranslations();
  const tEligibility = useTranslations('eligibility');

  const [showFilters, setShowFilters] = useState(false);

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
      headerName: t('fields.name'),
      flex: 1,
    },
    {
      field: 'phone',
      headerName: t('fields.phone'),
      flex: 1,
      sortable: false,
    },
    {
      field: 'oib',
      headerName: t('fields.oib'),
      flex: 1,
      disableColumnMenu: true,
    },
    {
      field: 'bloodType',
      headerName: t('fields.bloodType'),
      flex: 1,
      valueGetter: (value: keyof typeof BLOOD_TYPES) => BLOOD_TYPES[value],
    },
    {
      field: 'donationCount',
      headerName: t('fields.donations'),
      flex: 1,
    },
    {
      field: 'lastDonation',
      headerName: t('fields.lastDonation'),
      flex: 1,
      renderCell: (params) => formatDay(params.value),
      valueGetter: (value) => value && new Date(value),
      type: 'date',
    },
    {
      field: 'gender',
      headerName: t('fields.gender'),
      flex: 0,
      valueGetter: (value: (typeof GENDERS)[number]) =>
        value ? t(`gendersShort.${value}`) : '',
    },

    {
      field: 'dob',
      headerName: t('fields.dob'),
      flex: 1,
      renderCell: (params) => formatDay(params.value),
      valueGetter: (value) => value && new Date(value),
      type: 'date',
    },
    {
      field: 'eligibility',
      headerName: t('fields.nextEligible'),
      flex: 1,
      sortable: false,
      renderCell: (params: { row: DonorListItem }) => {
        const eligibility = params.row.eligibility;
        return (
          <Tooltip title={eligibilityReason(eligibility, tEligibility)}>
            <Typography
              variant='inherit'
              component='span'
              color={
                eligibility?.status === 'ELIGIBLE' ? 'success.main' : 'inherit'
              }
            >
              {eligibilityLabel(eligibility, tEligibility)}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: 'actions',
      headerName: t('fields.actions'),
      disableColumnMenu: true,
      sortable: false,
      minWidth: 200,
      renderCell: (params: { row: Donor }) => (
        <Button
          variant='outlined'
          size='medium'
          color='inherit'
          sx={{ width: '190px' }}
          onClick={(event) => {
            event.stopPropagation();
            router.push(
              `${ROUTE_PATHS.PROTECTED.DONORS.path}/${params.row.id}/donations`
            );
          }}
        >
          {t('donors.seeDonations', { count: params.row.donationCount })}
        </Button>
      ),
    },
  ];

  const searchDonorsDelayed = React.useMemo(() => {
    return debounce((event) => {
      changeFilterModel({
        ...filterModel,
        quickFilterValues: [event.target.value || ''],
      });
    }, 500);
  }, []);

  return (
    <>
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Typography variant='h1'>{t('donors.title')}</Typography>
        <Stack direction='row' gap={2}>
          <Button
            variant='outlined'
            size='medium'
            color='inherit'
            href={exportDonorsDownloadLink}
            target='_blank'
          >
            {t('donors.exportCsv')}
          </Button>
          <Link href={`${ROUTE_PATHS.PROTECTED.DONORS.path}/create`}>
            <Button color='secondary' size='medium' startIcon={<MdAdd />}>
              {t('donors.new')}
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
            label={t('donors.search')}
            placeholder={t('donors.searchPlaceholder')}
            variant='standard'
            sx={{ width: '50%' }}
            onChange={searchDonorsDelayed}
          />
          <Button
            variant='outlined'
            size='medium'
            color='inherit'
            onClick={() => setShowFilters(!showFilters)}
          >
            {t('donors.filter')}
          </Button>
        </Stack>
        {showFilters && (
          <DonorsFilters
            filterModel={filterModel}
            changeFilterModel={changeFilterModel}
          />
        )}
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
