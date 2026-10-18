// labelKey is a message key under "nav".
export const ROUTE_PATHS = {
  PROTECTED: {
    // The home page; "/" redirects here (next.config.js).
    OVERVIEW: { path: '/overview', labelKey: 'overview' },
    DONORS: { path: '/donors', labelKey: 'donors' },
    DONATIONS: { path: '/donations', labelKey: 'donations' },
    ACTIONS: { path: '/actions', labelKey: 'actions' },
    PLACES: { path: '/places', labelKey: 'places' },
  },
  PUBLIC: {
    LOGIN: { path: '/login' },
  },
} as const;
