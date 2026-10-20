// labelKey is a message key under "nav"; adminOnly pages are left out of the
// menu for volunteers (their APIs refuse them anyway).
export const ROUTE_PATHS = {
  PROTECTED: {
    // The home page; "/" redirects here (next.config.js).
    OVERVIEW: { path: '/overview', labelKey: 'overview' },
    DONORS: { path: '/donors', labelKey: 'donors' },
    DONATIONS: { path: '/donations', labelKey: 'donations' },
    ACTIONS: { path: '/actions', labelKey: 'actions' },
    PLACES: { path: '/places', labelKey: 'places' },
    CALL_LIST: { path: '/call-list', labelKey: 'callList' },
    REPORTS: { path: '/reports', labelKey: 'reports' },
    USERS: { path: '/users', labelKey: 'users', adminOnly: true },
  },
  // Not in the menu.
  ACCOUNT: {
    PASSWORD: { path: '/account/password' },
  },
  PUBLIC: {
    LOGIN: { path: '/login' },
  },
} as const;

// The menu entries this user may see.
export function menuRoutes(isAdmin: boolean) {
  return Object.values(ROUTE_PATHS.PROTECTED).filter(
    (route) => isAdmin || !('adminOnly' in route && route.adminOnly)
  );
}
