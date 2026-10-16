// A fresh, unguessable nonce for each request.
export function createNonce(): string {
  return btoa(crypto.randomUUID());
}

// Scripts run only with this request's nonce ('strict-dynamic' lets those
// scripts load Next.js chunks). Styles still allow 'unsafe-inline' because
// MUI and the DataGrid set inline style attributes, which nonces can't cover.
// React's development build also needs 'unsafe-eval'.
export function buildContentSecurityPolicy(
  nonce: string | null | undefined,
  isDev: boolean
): string {
  if (!nonce) {
    throw new Error(
      'A nonce is required to build the Content-Security-Policy.'
    );
  }
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${
      isDev ? " 'unsafe-eval'" : ''
    }`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}
