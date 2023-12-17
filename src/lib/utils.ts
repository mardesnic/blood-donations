import {
  APP_TITLE,
  DATA_GRID_PRISMA_TRANSLATION_MAP,
  ENABLED_GRID_DATE_OPERATORS,
  ENABLED_GRID_NUMERIC_OPERATORS,
  ENABLED_GRID_SINGLE_SELECT_OPERATORS,
  ENABLED_GRID_STRING_OPERATORS,
} from '@/lib/const';
import { GridFilterModel, GridSortModel } from '@mui/x-data-grid';

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
  sortField?: string;
  sort?: string;
} {
  let sortField = undefined;
  let sort = undefined;
  if (!sortString) {
    return { sortField, sort };
  }
  [sortField, sort] = sortString.split('|');
  return { sortField, sort };
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
