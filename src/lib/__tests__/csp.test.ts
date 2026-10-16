import { describe, expect, it } from 'vitest';
import { buildContentSecurityPolicy, createNonce } from '@/lib/csp';

describe('createNonce', () => {
  it('returns a different base64 value each time', () => {
    const a = createNonce();
    const b = createNonce();
    expect(a).toMatch(/^[A-Za-z0-9+/]+=*$/);
    expect(a).not.toBe(b);
  });
});

describe('buildContentSecurityPolicy', () => {
  it('requires a nonce', () => {
    for (const nonce of [null, undefined, '']) {
      expect(() => buildContentSecurityPolicy(nonce, false)).toThrow();
    }
  });

  it('only allows scripts with the nonce in production', () => {
    const csp = buildContentSecurityPolicy('abc', false);
    expect(csp).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic'");
    expect(csp).not.toContain('unsafe-eval');
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/);
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it('allows eval only in development', () => {
    expect(buildContentSecurityPolicy('abc', true)).toContain(
      "'strict-dynamic' 'unsafe-eval'"
    );
  });
});
