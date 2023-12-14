export const APP_TITLE = 'Blood Donations';
export const APP_DESCRIPTION = 'App to track blood donations.';

export const DATE_TIME_FORMAT = 'DD.MM.YYYY. HH:mm';
export const DATE_FORMAT = 'DD.MM.YYYY.';
export const PAGE_SIZE = 10;

export const reactQueryKeys = {
  places: {
    all: () => ['PLACES'] as const,
  },
  actions: {
    all: () => ['ACTIONS'] as const,
  },
  donations: {
    all: () => ['DONATIONS'] as const,
    list: (
      page: number,
      pageSize: number,
      search: string,
      filter: string,
      sort: string
    ) =>
      [
        ...reactQueryKeys.donations.all(),
        { page, pageSize, search, filter, sort },
      ] as const,
  },
  donors: {
    all: () => ['DONORS'] as const,
    list: (
      page: number,
      pageSize: number,
      search: string,
      filter: string,
      sort: string
    ) =>
      [
        ...reactQueryKeys.donors.all(),
        { page, pageSize, search, filter, sort },
      ] as const,
  },
};

export const DATA_GRID_PRISMA_TRANSLATION_MAP: {
  [key: string]: string;
} = {
  '>': 'gt',
  '<': 'lt',
  '<=': 'lte',
  '>=': 'gte',
  '=': 'equals',
  equals: 'equals',
  contains: 'contains',
  is: 'equals',
  not: 'not',
  isAnyOf: 'in',
  after: 'gt',
  before: 'lt',
};

export const ENABLED_GRID_NUMERIC_OPERATORS = ['>', '<', '=', '<=', '>='];
export const ENABLED_GRID_STRING_OPERATORS = ['contains', 'equals'];
export const ENABLED_GRID_DATE_OPERATORS = ['is', 'after', 'before'];
export const ENABLED_GRID_SINGLE_SELECT_OPERATORS = ['not', 'isAnyOf'];
