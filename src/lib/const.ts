export const APP_TITLE = 'Blood Donations';
export const APP_DESCRIPTION = 'App to track blood donations.';
export const DATE_TIME_FORMAT = 'DD.MM.YYYY. HH:mm';
export const DATE_FORMAT = 'DD.MM.YYYY.';
export const PAGE_SIZE = 10;
export const reactQueryKeys = {
  places: {
    all: () => ['PLACES'] as const,
    list: (
      page: number,
      pageSize: number,
      search: string,
      filter: string,
      sort: string
    ) =>
      [
        ...reactQueryKeys.places.all(),
        { page, pageSize, search, filter, sort },
      ] as const,
  },
  actions: {
    all: () => ['ACTIONS'] as const,
    list: (
      page: number,
      pageSize: number,
      search: string,
      filter: string,
      sort: string,
      placeId: string
    ) =>
      [
        ...reactQueryKeys.actions.all(),
        { page, pageSize, search, filter, sort, placeId },
      ] as const,
  },
  donations: {
    all: () => ['DONATIONS'] as const,
    list: (
      page: number,
      pageSize: number,
      search: string,
      filter: string,
      sort: string,
      donorId: string,
      actionId: string
    ) =>
      [
        ...reactQueryKeys.donations.all(),
        { page, pageSize, search, filter, sort, donorId, actionId },
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
  [key: string]: { prismaOperator: string; mode?: string };
} = {
  '>': { prismaOperator: 'gt' },
  '<': { prismaOperator: 'lt' },
  '<=': { prismaOperator: 'lte' },
  '>=': { prismaOperator: 'gte' },
  '=': { prismaOperator: 'equals' },
  equals: { prismaOperator: 'equals', mode: 'insensitive' },
  contains: { prismaOperator: 'contains', mode: 'insensitive' },
  is: { prismaOperator: 'equals' },
  not: { prismaOperator: 'not' },
  isAnyOf: { prismaOperator: 'in' },
  after: { prismaOperator: 'gt' },
  before: { prismaOperator: 'lt' },
};

export const ENABLED_GRID_NUMERIC_OPERATORS = ['>', '<', '=', '<=', '>='];
export const ENABLED_GRID_STRING_OPERATORS = ['contains', 'equals'];
export const ENABLED_GRID_DATE_OPERATORS = ['is', 'after', 'before'];
export const ENABLED_GRID_SINGLE_SELECT_OPERATORS = ['not', 'isAnyOf'];

interface BloodTypes {
  [key: string]: string;
}
export const BLOOD_TYPES: BloodTypes = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB+',
  O_POSITIVE: '0+',
  O_NEGATIVE: '0+',
};

interface Gender {
  short: string;
  full: string;
}

export const GENDERS: { [key: string]: Gender } = {
  MALE: {
    short: 'M',
    full: 'Male',
  },
  FEMALE: {
    short: 'F',
    full: 'Female',
  },
};
