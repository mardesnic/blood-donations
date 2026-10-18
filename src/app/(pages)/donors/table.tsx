'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Badge,
  Button,
  Link as MuiLink,
  Tooltip,
  useMediaQuery,
  useTheme,
  Typography,
} from '@mui/material';
import { TruncatedText } from '@/components/TruncatedText';
import Link from 'next/link';
import { MdAdd, MdFilterList } from 'react-icons/md';

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
import { DonorsActiveFilters } from '@/app/(pages)/donors/activeFilters';
import { activeFilters, donorListToSearchParams } from '@/lib/donorFilterModel';
import { debounce } from '@mui/material/utils';

export default function DonorsTable() {
  const router = useRouter();
  const t = useTranslations();
  const tEligibility = useTranslations('eligibility');
  // Phones show name, blood type and next eligible date; tablets add the
  // phone number and donations; wider screens show every column.
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const columnVisibilityModel = {
    phone: !isPhone,
    oib: !isTablet,
    donationCount: !isPhone,
    lastDonation: !isPhone,
    gender: !isTablet,
    dob: !isTablet,
  };

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
    urlVersion,
    sortModel,
    paginationModel,
  } = useDonorsContext();

  const donorPath = (id: string) =>
    `${ROUTE_PATHS.PROTECTED.DONORS.path}/${id}`;
  // Fixed widths for short values, so the name and dates get the room.
  const columns: GridColDef<DonorListItem>[] = [
    {
      field: 'fullName',
      headerName: t(isPhone ? 'fields.nameShort' : 'fields.name'),
      flex: 2,
      minWidth: isPhone ? 120 : 180,
      renderCell: (params) => <TruncatedText text={params.value} />,
    },
    {
      field: 'phone',
      headerName: t('fields.phone'),
      flex: 1,
      minWidth: 130,
      sortable: false,
      renderCell: (params) => <TruncatedText text={params.value} />,
    },
    {
      field: 'oib',
      headerName: t('fields.oib'),
      width: 135,
    },
    {
      field: 'bloodType',
      // Short headers on phones, where the columns are narrow.
      headerName: t(isPhone ? 'fields.bloodTypeShort' : 'fields.bloodType'),
      width: isPhone ? 80 : 130,
      valueGetter: (value: keyof typeof BLOOD_TYPES) => BLOOD_TYPES[value],
    },
    {
      field: 'donationCount',
      headerName: t('fields.donations'),
      width: 120,
      // Opens the donor's donations; the rest of the row opens the donor.
      renderCell: (params) => (
        <MuiLink
          component={Link}
          href={`${donorPath(params.row.id)}/donations`}
          onClick={(event: React.MouseEvent) => event.stopPropagation()}
          underline='always'
          color='secondary'
        >
          {params.value}
        </MuiLink>
      ),
    },
    {
      field: 'lastDonation',
      headerName: t('fields.lastDonation'),
      flex: 1,
      // Room for the title and the sort arrow.
      minWidth: 195,
      renderCell: (params) => formatDay(params.value),
      valueGetter: (value) => value && new Date(value),
      type: 'date',
    },
    {
      field: 'gender',
      headerName: t('fields.gender'),
      width: 85,
      valueGetter: (value: (typeof GENDERS)[number]) =>
        value ? t(`gendersShort.${value}`) : '',
    },
    {
      field: 'dob',
      headerName: t('fields.dob'),
      flex: 1,
      // Room for the title and the sort arrow.
      minWidth: 180,
      renderCell: (params) => formatDay(params.value),
      valueGetter: (value) => value && new Date(value),
      type: 'date',
    },
    {
      field: 'eligibility',
      headerName: t(
        isPhone ? 'fields.nextEligibleShort' : 'fields.nextEligible'
      ),
      flex: 1,
      minWidth: isPhone ? 110 : 190,
      sortable: false,
      renderCell: (params) => {
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
  ];

  // Updates the current model, so filters set while typing are kept.
  const searchDonorsDelayed = React.useMemo(
    () =>
      debounce((event: React.ChangeEvent<HTMLInputElement>) => {
        const search = event.target.value || '';
        changeFilterModel((current) => ({
          ...current,
          quickFilterValues: [search],
        }));
      }, 500),
    [changeFilterModel]
  );
  const filterCount = activeFilters(filterModel).length;

  // Keeps the URL in step with the filters without reloading the page or
  // adding a history entry for every change.
  React.useEffect(() => {
    const query = donorListToSearchParams({
      filterModel,
      sortModel,
      paginationModel,
    }).toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
    if (url !== `${window.location.pathname}${window.location.search}`) {
      // null lets Next.js keep its own history state with the new URL, so
      // Back returns to the filtered list.
      window.history.replaceState(null, '', url);
    }
  }, [filterModel, sortModel, paginationModel]);

  return (
    <>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        flexWrap='wrap'
        gap={2}
      >
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
          gap={2}
          sx={{ p: '30px 24px' }}
        >
          <TextField
            key={urlVersion}
            color='secondary'
            label={t('donors.search')}
            placeholder={t('donors.searchPlaceholder')}
            variant='standard'
            sx={{ width: { xs: '100%', md: '50%' } }}
            defaultValue={filterModel.quickFilterValues?.[0] || ''}
            onChange={searchDonorsDelayed}
          />
          <Badge badgeContent={filterCount} color='primary'>
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              size='medium'
              color={showFilters ? 'secondary' : 'inherit'}
              startIcon={<MdFilterList />}
              aria-expanded={showFilters}
              onClick={() => setShowFilters(!showFilters)}
            >
              {t('donors.filter')}
            </Button>
          </Badge>
        </Stack>
        {showFilters ? (
          <DonorsFilters
            key={urlVersion}
            filterModel={filterModel}
            changeFilterModel={changeFilterModel}
          />
        ) : (
          <DonorsActiveFilters
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
          columnVisibilityModel={columnVisibilityModel}
          paginationModel={paginationModel}
          onPaginationModelChange={changePaginationModel}
          sortingMode='server'
          sortModel={sortModel}
          // Always sorted by something, so there is no "unsorted" step.
          sortingOrder={['asc', 'desc']}
          onSortModelChange={changeSortModel}
          disableColumnMenu
          sx={{
            border: 0,
            mt: '24px',
            '& .donor-inactive': { color: 'text.disabled' },
          }}
          getRowHeight={() => 55}
          getRowClassName={(params) =>
            params.row.active ? '' : 'donor-inactive'
          }
          disableColumnFilter={true}
          onRowClick={(row) => router.push(donorPath(String(row.id)))}
        />
      </Card>
    </>
  );
}
