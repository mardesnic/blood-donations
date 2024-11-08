'use client';
import React from 'react';
import { MenuItem, TextField, Stack } from '@mui/material';
import { GridFilterModel } from '@mui/x-data-grid';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { GENDERS, BLOOD_TYPES, DATE_FORMAT, STATUSES } from '@/lib/const';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface Props {
  filterModel: GridFilterModel;
  changeFilterModel: (filterModel: GridFilterModel) => void;
}

export const DonorsFilters = (props: Props) => {
  const { filterModel, changeFilterModel } = props;

  const getValueFromFilterModel = (field: string) =>
    filterModel?.items?.find((item) => item.field === field)?.value;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='de'>
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        gap={2}
        p='24px'
      >
        <TextField
          label='Blood Types'
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
          label='Gender'
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
          {Object.keys(GENDERS).map((gender) => (
            <MenuItem key={gender} value={gender}>
              {GENDERS[gender].full}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label='Donations'
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
          label='Last donation date'
          value={getValueFromFilterModel('lastDonation') || ''}
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
          label='City'
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
          label='Date of Birth'
          value={getValueFromFilterModel('dob') || ''}
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
          label='Status'
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
          {Object.keys(STATUSES).map((status) => (
            <MenuItem key={status} value={status}>
              {STATUSES[status]}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </LocalizationProvider>
  );
};
