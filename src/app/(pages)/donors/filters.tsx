'use client';
import React from 'react';
import { MenuItem, TextField, Stack } from '@mui/material';
import { GridFilterModel } from '@mui/x-data-grid';

import { GENDERS, BLOOD_TYPES, DATE_FORMAT, STATUSES } from '@/lib/const';
import { DatePicker } from '@mui/x-date-pickers';
import { useTranslations } from 'next-intl';

interface Props {
  filterModel: GridFilterModel;
  changeFilterModel: (filterModel: GridFilterModel) => void;
}

export const DonorsFilters = (props: Props) => {
  const { filterModel, changeFilterModel } = props;
  const t = useTranslations();

  const getValueFromFilterModel = (field: string) =>
    filterModel?.items?.find((item) => item.field === field)?.value;

  return (
    <Stack
      direction='row'
      justifyContent='space-between'
      alignItems='center'
      gap={2}
      p='24px'
    >
      <TextField
        label={t('fields.bloodTypes')}
        name='bloodTypes'
        value={getValueFromFilterModel('bloodType') || []}
        onChange={(event) => {
          const items = [...(filterModel?.items || [])].filter(
            (item) => item.field !== 'bloodType'
          );
          items.push({
            field: 'bloodType',
            operator: 'isAnyOf',
            value: event.target.value,
          });

          changeFilterModel({
            ...filterModel,
            items,
          });
        }}
        select
        SelectProps={{
          multiple: true,
        }}
      >
        {Object.keys(BLOOD_TYPES).map((bloodType) => (
          <MenuItem key={bloodType} value={bloodType}>
            {BLOOD_TYPES[bloodType]}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label={t('fields.gender')}
        name='gender'
        value={getValueFromFilterModel('gender') || ''}
        onChange={(event) => {
          const items = [...(filterModel?.items || [])].filter(
            (item) => item.field !== 'gender'
          );

          items.push({
            field: 'gender',
            operator: 'is',
            value: event.target.value,
          });

          changeFilterModel({
            ...filterModel,
            items,
          });
        }}
        select
      >
        {GENDERS.map((gender) => (
          <MenuItem key={gender} value={gender}>
            {t(`genders.${gender}`)}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label={t('fields.donations')}
        name='donationCount'
        type='number'
        value={getValueFromFilterModel('donationCount') || ''}
        onChange={(event) => {
          const items = [...(filterModel?.items || [])].filter(
            (item) => item.field !== 'donationCount'
          );

          items.push({
            field: 'donationCount',
            operator: '=',
            value: event.target.value,
          });

          changeFilterModel({
            ...filterModel,
            items,
          });
        }}
        InputLabelProps={{ shrink: true }}
      />

      <DatePicker
        label={t('fields.lastDonationDate')}
        value={getValueFromFilterModel('lastDonation') || null}
        onChange={(value) => {
          const items = [...(filterModel?.items || [])].filter(
            (item) => item.field !== 'lastDonation'
          );

          if (value) {
            items.push({
              field: 'lastDonation',
              operator: 'is',
              value,
            });
          }

          changeFilterModel({
            ...filterModel,
            items,
          });
        }}
        format={DATE_FORMAT}
        slotProps={{
          actionBar: {
            actions: ['clear'],
          },
        }}
      />

      <TextField
        label={t('fields.city')}
        name='city'
        value={getValueFromFilterModel('city') || ''}
        onChange={(event) => {
          const items = [...(filterModel?.items || [])].filter(
            (item) => item.field !== 'city'
          );

          items.push({
            field: 'city',
            operator: 'equals',
            value: event.target.value,
          });

          changeFilterModel({
            ...filterModel,
            items,
          });
        }}
        InputLabelProps={{ shrink: true }}
      />

      <DatePicker
        label={t('fields.dob')}
        value={getValueFromFilterModel('dob') || null}
        onChange={(value) => {
          const items = [...(filterModel?.items || [])].filter(
            (item) => item.field !== 'dob'
          );

          if (value) {
            items.push({
              field: 'dob',
              operator: 'is',
              value,
            });
          }

          changeFilterModel({
            ...filterModel,
            items,
          });
        }}
        format={DATE_FORMAT}
        slotProps={{
          actionBar: {
            actions: ['clear'],
          },
        }}
      />

      <TextField
        label={t('fields.status')}
        name='status'
        value={getValueFromFilterModel('active') || ''}
        onChange={(event) => {
          const items = [...(filterModel?.items || [])].filter(
            (item) => item.field !== 'active'
          );

          items.push({
            field: 'active',
            operator: 'is',
            value: event.target.value,
          });

          changeFilterModel({
            ...filterModel,
            items,
          });
        }}
        select
      >
        {STATUSES.map((status) => (
          <MenuItem key={status} value={status}>
            {t(`statuses.${status}`)}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label={t('fields.eligibility')}
        name='eligible'
        value={getValueFromFilterModel('eligible') || ''}
        onChange={(event) => {
          const items = [...(filterModel?.items || [])].filter(
            (item) => item.field !== 'eligible'
          );
          if (event.target.value) {
            items.push({
              field: 'eligible',
              operator: 'is',
              value: event.target.value,
            });
          }
          changeFilterModel({
            ...filterModel,
            items,
          });
        }}
        select
      >
        <MenuItem value=''>
          <em>{t('common.any')}</em>
        </MenuItem>
        <MenuItem value='NOW'>{t('eligibility.eligibleNow')}</MenuItem>
      </TextField>
    </Stack>
  );
};
