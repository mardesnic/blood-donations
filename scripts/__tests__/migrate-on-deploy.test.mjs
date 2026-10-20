import { describe, expect, it } from 'vitest';
import { migrationPlan } from '../migrate-on-deploy.mjs';

describe('migrationPlan', () => {
  it('skips for null, undefined and empty environments', () => {
    expect(migrationPlan(null)).toBe('skip');
    expect(migrationPlan(undefined)).toBe('skip');
    expect(migrationPlan({})).toBe('skip');
  });

  it('skips preview and development deploys, even with a database', () => {
    const url = 'postgresql://example/db';
    expect(
      migrationPlan({ VERCEL_ENV: 'preview', POSTGRES_URL_NON_POOLING: url })
    ).toBe('skip');
    expect(
      migrationPlan({
        VERCEL_ENV: 'development',
        POSTGRES_URL_NON_POOLING: url,
      })
    ).toBe('skip');
  });

  it('migrates production, and refuses without a database URL', () => {
    expect(
      migrationPlan({
        VERCEL_ENV: 'production',
        POSTGRES_URL_NON_POOLING: 'postgresql://example/db',
      })
    ).toBe('migrate');
    expect(migrationPlan({ VERCEL_ENV: 'production' })).toBe('missing-url');
    expect(
      migrationPlan({ VERCEL_ENV: 'production', POSTGRES_URL_NON_POOLING: ' ' })
    ).toBe('missing-url');
  });
});
