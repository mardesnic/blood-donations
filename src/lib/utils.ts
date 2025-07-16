import dayjs from 'dayjs';

import {
  APP_TITLE,
  DATA_GRID_PRISMA_TRANSLATION_MAP,
  ENABLED_GRID_DATE_OPERATORS,
  ENABLED_GRID_NUMERIC_OPERATORS,
  ENABLED_GRID_SINGLE_SELECT_OPERATORS,
  ENABLED_GRID_STRING_OPERATORS,
} from '@/lib/const';
import { GridFilterModel, GridSortModel } from '@mui/x-data-grid';
import { DenyReasonType } from '@prisma/client';

export function generatePageTitle(title: string = '') {
  return `${title ? `${title} | ` : ''}${APP_TITLE}`;
}

export function getDisplayName(input: string[]): string {
  return input.filter(Boolean).join(' ');
}

export function generateFilterString(filterModel: GridFilterModel): string {
  const filterItem = filterModel?.items?.[0];
  if (!filterItem) {
    return '';
  }
  return `${filterItem?.field || ''}|${filterItem?.operator || ''}|${
    filterItem?.value || ''
  }`;
}

export function generateFilterStringForItems(
  filterModel: GridFilterModel
): string[] {
  return filterModel?.items?.map((filterItem) => {
    let value = filterItem?.value || '';

    if (dayjs.isDayjs(value)) {
      value = `${dayjs(value).format('YYYY-MM-DD')}T00:00:00.000Z`;
    }

    return `${filterItem?.field || ''}|${filterItem?.operator || ''}|${value}`;
  });
}

export function generateSortString(sortModel: GridSortModel): string {
  const sortItem = sortModel?.[0];
  if (!sortItem) {
    return '';
  }
  return `${sortItem?.field || ''}|${sortItem?.sort || ''}`;
}

export function generateFilterFieldsFromFilterString(filterString: string): {
  filterField: string;
  filterOperator: string;
  filterTerm: string;
} {
  let filterField = '';
  let filterOperator = '';
  let filterTerm = '';
  if (!filterString) {
    return { filterField, filterOperator, filterTerm };
  }
  [filterField, filterOperator, filterTerm] = filterString.split('|');
  return { filterField, filterOperator, filterTerm };
}

export function generateSortFieldsFromSortString(sortString: string): {
  sortField: string;
  sort: 'asc' | 'desc';
} {
  const DEFAULT_FIELD = 'createdAt';
  const DEFAULT_SORT: 'asc' | 'desc' = 'desc';

  if (!sortString) {
    return { sortField: DEFAULT_FIELD, sort: DEFAULT_SORT };
  }

  const [sortField, sortDirection] = sortString.split('|');

  const safeSort: 'asc' | 'desc' = sortDirection === 'asc' ? 'asc' : 'desc';

  return {
    sortField: sortField || DEFAULT_FIELD,
    sort: safeSort,
  };
}

export function getPrismaOperatorFromGridOperator(operator: string): {
  prismaOperator: string;
  mode: string | undefined;
} {
  const { prismaOperator, mode } = DATA_GRID_PRISMA_TRANSLATION_MAP[operator];
  if (!prismaOperator) {
    throw new Error('Filter operator not implemented.');
  }
  return { prismaOperator, mode };
}

export function getPrismaTermFromGridOperator(
  operator: string,
  term: string
): string | number | Date | string[] {
  if (typeof term === 'undefined') {
    return '';
  }
  if (ENABLED_GRID_NUMERIC_OPERATORS.includes(operator)) {
    return term === '' ? '' : parseInt(term.toString(), 10) || 0;
  }
  if (ENABLED_GRID_STRING_OPERATORS.includes(operator)) {
    return term.toString() || '';
  }
  if (ENABLED_GRID_SINGLE_SELECT_OPERATORS.includes(operator)) {
    const isMulti = operator === 'isAnyOf';
    if (isMulti) {
      const terms = term.split(',');
      return terms.filter(Boolean).length ? terms : '';
    }
    return term.toString() || '';
  }
  if (ENABLED_GRID_DATE_OPERATORS.includes(operator)) {
    try {
      const date = new Date(term).toJSON().slice(0, 10);
      return new Date(date);
    } catch (error) {
      return '';
    }
  }
  throw new Error('Filter term invalid.');
}

export function getDateFromDateTime(date: Date | string): Date {
  return new Date(new Date(date).toISOString().split('T')[0]);
}

export function generateExportDownloadLink(
  baseUrl: string,
  search: string,
  filterModel: GridFilterModel,
  sortModel: GridSortModel
): string {
  const searchString = `search=${encodeURIComponent(search || '')}`;
  const filterString = `filter=${encodeURIComponent(
    generateFilterString(filterModel) || ''
  )}`;
  const sortString = `sort=${encodeURIComponent(
    generateSortString(sortModel) || ''
  )}`;
  const queryStringParts = [searchString, filterString, sortString].filter(
    Boolean
  );

  return `${baseUrl}?${queryStringParts.join('&')}`;
}

export function getDenyReasonDescription(denyReason: DenyReasonType): string {
  const descriptions: Record<DenyReasonType, string> = {
    [DenyReasonType.SEVEN_DAYS]: '7 Days',
    [DenyReasonType.FIFTEEN_DAYS]: '15 Days',
    [DenyReasonType.ONE_MONTH]: '1 Month',
    [DenyReasonType.SIX_MONTHS]: '6 Months',
    [DenyReasonType.ONE_YEAR]: '1 Year',
    [DenyReasonType.LONGER]: 'Longer',
    [DenyReasonType.PERMANENT]: 'Permanent',
  };
  return descriptions[denyReason] || denyReason;
}
