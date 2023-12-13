import {
  APP_TITLE,
  DATA_GRID_PRISMA_TRANSLATION_MAP,
  ENABLED_GRID_DATE_OPERATORS,
  ENABLED_GRID_NUMERIC_OPERATORS,
  ENABLED_GRID_SINGLE_SELECT_OPERATORS,
  ENABLED_GRID_STRING_OPERATORS,
} from '@/lib/const';
import { GridFilterModel } from '@mui/x-data-grid';

export function generatePageTitle(title: string = '') {
  return `${title ? `${title} | ` : ''}${APP_TITLE}`;
}

export function getDisplayName(input: string[]): string {
  return input.filter(Boolean).join(' ');
}

export function generateFilterString(filterModel: GridFilterModel): string {
  const filter = filterModel?.items?.[0];
  if (!filter) {
    return '';
  }
  return `${filter?.field || ''}|${filter?.operator || ''}|${
    filter?.value || ''
  }`;
}

export function getPrismaOperatorFromGridOperator(operator: string): string {
  const prismaOperator = DATA_GRID_PRISMA_TRANSLATION_MAP[operator];
  if (!prismaOperator) {
    throw new Error('Filter operator not implemented.');
  }
  return prismaOperator;
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
