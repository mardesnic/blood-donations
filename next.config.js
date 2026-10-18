import createNextIntlPlugin from 'next-intl/plugin';

// Loads the messages for the request's language (see src/i18n/request.ts).
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// The Content-Security-Policy is set per request in src/proxy.ts, because it
// carries a fresh nonce each time.
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  poweredByHeader: false,
  async redirects() {
    return [
      // A donor's donations moved to the donor's overview page.
      {
        source: '/donors/:id/donations',
        destination: '/donors/:id#donations',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
