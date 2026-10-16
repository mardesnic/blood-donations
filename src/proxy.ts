import type { NextFetchEvent } from 'next/server';
import { withAuth, NextRequestWithAuth } from 'next-auth/middleware';

// Redirects signed-out visitors to the login page (Next 16 calls middleware
// "proxy" and needs the function defined in this file).
export function proxy(req: NextRequestWithAuth, event: NextFetchEvent) {
  return withAuth(req, event);
}

export const config = {
  matcher: [
    '/((?!login).*)', // This regex matches all routes except '/login'
  ],
};
