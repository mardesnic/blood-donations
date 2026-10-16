import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from 'next/server';
import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware';
import { buildContentSecurityPolicy, createNonce } from '@/lib/csp';

// Adds a per-request nonce Content-Security-Policy. Next.js reads the nonce
// from the request's CSP header and puts it on its own scripts.
function withCsp(req: NextRequest) {
  const csp = buildContentSecurityPolicy(
    createNonce(),
    process.env.NODE_ENV !== 'production'
  );
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('Content-Security-Policy', csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

// Signed-out visitors are redirected to the login page; signed-in ones get
// the page with the CSP.
const signedIn = withAuth((req) => withCsp(req));

export function proxy(req: NextRequestWithAuth, event: NextFetchEvent) {
  if (req.nextUrl.pathname === '/login') {
    return withCsp(req);
  }
  return signedIn(req, event);
}

export const config = {
  matcher: [
    {
      // API routes check the session themselves and need no CSP; static
      // files and prefetches don't need one either.
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
