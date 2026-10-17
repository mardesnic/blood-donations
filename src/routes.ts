// labelKey is a message key under "nav".
export const ROUTE_PATHS = {
  PROTECTED: {
    DONORS: { path: '/donors', labelKey: 'donors' },
    DONATIONS: { path: '/donations', labelKey: 'donations' },
    ACTIONS: { path: '/actions', labelKey: 'actions' },
  },
  PUBLIC: {
    LOGIN: { path: '/login' },
  },
} as const;
