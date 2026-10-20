'use client';

import React from 'react';
import { Chip, Stack } from '@mui/material';
import { GridFilterItem, GridFilterModel } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { BLOOD_TYPES, DATE_FORMAT } from '@/lib/const';
import { activeFilters, setFilter } from '@/lib/donorFilterModel';

interface Props {
  filterModel: GridFilterModel;
  changeFilterModel: React.Dispatch<React.SetStateAction<GridFilterModel>>;
}

// One removable chip per active filter, so filters stay visible while the
// filter panel is closed.
export const DonorsActiveFilters = ({
  filterModel,
  changeFilterModel,
}: Props) => {
  const t = useTranslations();
  const items = activeFilters(filterModel);
  if (!items.length) {
    return null;
  }

  const describe = ({ field, operator, value }: GridFilterItem): string => {
    const chip = (label: string, text: string) =>
      t('filters.chip', { label, value: text });
    switch (field) {
      case 'eligible':
        return t('eligibility.eligibleNow');
      case 'bloodType':
        return chip(
          t('fields.bloodTypes'),
          (value as string[]).map((v) => BLOOD_TYPES[v] || v).join(', ')
        );
      case 'gender':
        return chip(t('fields.gender'), t(`genders.${value}`));
      case 'active':
        return chip(t('fields.status'), t(`statuses.${value}`));
      case 'city':
        return chip(t('fields.city'), String(value));
      case 'donationCount':
        return chip(t('filters.minDonations'), String(value));
      case 'lastDonation':
        return chip(
          t(
            operator === 'onOrAfter'
              ? 'filters.lastDonationFrom'
              : 'filters.lastDonationTo'
          ),
          dayjs(value).format(DATE_FORMAT)
        );
      case 'age':
        return chip(
          t(operator === '>=' ? 'filters.ageFrom' : 'filters.ageTo'),
          String(value)
        );
      default:
        return chip(field, String(value));
    }
  };

  return (
    <Stack
      direction='row'
      aria-label={t('filters.active')}
      sx={{
        gap: 1,
        flexWrap: 'wrap',
        px: 3,
        pb: 2,
      }}
    >
      {items.map((item) => (
        <Chip
          key={`${item.field}|${item.operator}`}
          label={describe(item)}
          size='small'
          onDelete={() =>
            changeFilterModel((current) =>
              setFilter(current, item.field, item.operator, '')
            )
          }
        />
      ))}
    </Stack>
  );
};
