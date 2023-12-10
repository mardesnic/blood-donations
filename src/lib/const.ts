export const APP_TITLE = 'Blood Donations';
export const APP_DESCRIPTION = 'App to track blood donations.';

export const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm';
export const DATE_FORMAT = 'DD/MM/YYYY';
export const PAGE_SIZE = 10;

export const reactQueryKeys = {
  places: {
    all: () => ['PLACES'] as const,
  },
  actions: {
    all: () => ['ACTIONS'] as const,
  },
  donors: {
    all: () => ['DONORS'] as const,
    list: (page: number, pageSize: number) =>
      [...reactQueryKeys.donors.all(), { page, pageSize }] as const,
  },
};
