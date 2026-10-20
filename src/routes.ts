// labelKey is a message key under "nav". adminOnly pages are kept out of the
// main menu: admins find them in the account menu, volunteers don't see
// them at all (their APIs refuse them anyway).
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

type ProtectedRoute =
  (typeof ROUTE_PATHS.PROTECTED)[keyof typeof ROUTE_PATHS.PROTECTED];

const isAdminOnly = (route: ProtectedRoute) =>
  'adminOnly' in route && route.adminOnly;

// The main menu: the pages everyone works with day to day.
export function menuRoutes() {
  return Object.values(ROUTE_PATHS.PROTECTED).filter(
    (route) => !isAdminOnly(route)
  );
}

// Admin pages, shown in the account menu; none for volunteers.
export function adminMenuRoutes(isAdmin: boolean) {
  return isAdmin
    ? Object.values(ROUTE_PATHS.PROTECTED).filter(isAdminOnly)
    : [];
}
