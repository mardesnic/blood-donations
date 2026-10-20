'use client';
import React from 'react';
import {
  Box,
  Button,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { debounce } from '@mui/material/utils';
import { GridFilterModel } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers';
import { useTranslations } from 'next-intl';
import { Dayjs } from 'dayjs';

import { GENDERS, BLOOD_TYPES, DATE_FORMAT, STATUSES } from '@/lib/const';
import {
  activeFilters,
  clearFilters,
  getFilterValue,
  setFilter,
} from '@/lib/donorFilterModel';

interface Props {
  filterModel: GridFilterModel;
  changeFilterModel: React.Dispatch<React.SetStateAction<GridFilterModel>>;
}

export const DonorsFilters = ({ filterModel, changeFilterModel }: Props) => {
  const t = useTranslations();

  const value = (field: string, operator?: string) =>
    getFilterValue(filterModel, field, operator);
  const dayValue = (field: string, operator: string) =>
    (value(field, operator) as Dayjs | undefined) || null;
  const update = (field: string, operator: string, next: unknown) =>
    changeFilterModel((current) => setFilter(current, field, operator, next));

  // City is typed, so it filters once typing pauses.
  const [city, setCity] = React.useState(
    (getFilterValue(filterModel, 'city') as string) || ''
  );
  const updateCityDelayed = React.useMemo(
    () =>
      debounce((next: string) => {
        changeFilterModel((current) =>
          setFilter(current, 'city', 'contains', next.trim())
        );
      }, 500),
    [changeFilterModel]
  );

  const bloodTypes = (value('bloodType') as string[]) || [];
  const hasFilters = activeFilters(filterModel).length > 0;

  return (
    <Box sx={{ px: 3, pb: 3 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={value('eligible') === 'NOW'}
              onChange={(event) =>
                update('eligible', 'is', event.target.checked ? 'NOW' : '')
              }
            />
          }
          label={t('filters.eligibleOnly')}
        />
        <Stack
          direction='row'
          sx={{
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Typography
            variant='body2'
            sx={{
              color: 'text.secondary',
            }}
          >
            {t('fields.bloodTypes')}
          </Typography>
          <ToggleButtonGroup
            size='small'
            value={bloodTypes}
            onChange={(_, next: string[]) =>
              update('bloodType', 'isAnyOf', next)
            }
            aria-label={t('fields.bloodTypes')}
            sx={{ flexWrap: 'wrap' }}
          >
            {Object.keys(BLOOD_TYPES).map((bloodType) => (
              <ToggleButton
                key={bloodType}
                value={bloodType}
                sx={{ minWidth: 44, py: 0.5 }}
              >
                {BLOOD_TYPES[bloodType]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      <Grid container columnSpacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            label={t('fields.gender')}
            value={value('gender') || ''}
            onChange={(event) => update('gender', 'is', event.target.value)}
            select
            // Shows "Any" instead of an empty box.
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value=''>
              <em>{t('common.any')}</em>
            </MenuItem>
            {GENDERS.map((gender) => (
              <MenuItem key={gender} value={gender}>
                {t(`genders.${gender}`)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            label={t('fields.status')}
            value={value('active') || ''}
            onChange={(event) => update('active', 'is', event.target.value)}
            select
            // Shows "Any" instead of an empty box.
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value=''>
              <em>{t('common.any')}</em>
            </MenuItem>
            {STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {t(`statuses.${status}`)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            label={t('fields.city')}
            placeholder={t('filters.cityPlaceholder')}
            value={city}
            onChange={(event) => {
              setCity(event.target.value);
              updateCityDelayed(event.target.value);
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            label={t('filters.minDonations')}
            type='number'
            value={value('donationCount') ?? ''}
            onChange={(event) =>
              update('donationCount', '>=', event.target.value)
            }
            slotProps={{ htmlInput: { min: 0 } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Stack
            direction='row'
            sx={{
              gap: 2,
            }}
          >
            <TextField
              label={t('filters.ageFrom')}
              type='number'
              value={value('age', '>=') ?? ''}
              onChange={(event) => update('age', '>=', event.target.value)}
              slotProps={{ htmlInput: { min: 0, max: 150 } }}
            />
            <TextField
              label={t('filters.ageTo')}
              type='number'
              value={value('age', '<=') ?? ''}
              onChange={(event) => update('age', '<=', event.target.value)}
              slotProps={{ htmlInput: { min: 0, max: 150 } }}
            />
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack
            direction='row'
            sx={{
              gap: 2,
            }}
          >
            <DatePicker
              label={t('filters.lastDonationFrom')}
              value={dayValue('lastDonation', 'onOrAfter')}
              onChange={(next) => update('lastDonation', 'onOrAfter', next)}
              maxDate={dayValue('lastDonation', 'onOrBefore') ?? undefined}
              format={DATE_FORMAT}
              slotProps={{ actionBar: { actions: ['clear'] } }}
            />
            <DatePicker
              label={t('filters.lastDonationTo')}
              value={dayValue('lastDonation', 'onOrBefore')}
              onChange={(next) => update('lastDonation', 'onOrBefore', next)}
              minDate={dayValue('lastDonation', 'onOrAfter') ?? undefined}
              format={DATE_FORMAT}
              slotProps={{ actionBar: { actions: ['clear'] } }}
            />
          </Stack>
        </Grid>
      </Grid>

      <Stack
        direction='row'
        sx={{
          justifyContent: 'flex-end',
          mt: 1,
        }}
      >
        <Button
          variant='text'
          color='secondary'
          disabled={!hasFilters}
          onClick={() => {
            setCity('');
            updateCityDelayed.clear();
            changeFilterModel(clearFilters);
          }}
        >
          {t('filters.clear')}
        </Button>
      </Stack>
    </Box>
  );
};
