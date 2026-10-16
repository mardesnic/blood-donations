import { describe, expect, it } from 'vitest';
import { adminCredentials, isLocalDatabase } from '../seed';

const LOCAL = 'postgresql://u:p@localhost:5432/db';
const REMOTE = 'postgresql://u:p@db.example.com:5432/db';

describe('isLocalDatabase', () => {
  it('returns false for null, undefined, empty and invalid URLs', () => {
    expect(isLocalDatabase(null)).toBe(false);
    expect(isLocalDatabase(undefined)).toBe(false);
    expect(isLocalDatabase('')).toBe(false);
    expect(isLocalDatabase('not a url')).toBe(false);
  });

  it('recognises local hosts only', () => {
    expect(isLocalDatabase(LOCAL)).toBe(true);
    expect(isLocalDatabase('postgresql://u:p@127.0.0.1/db')).toBe(true);
    expect(isLocalDatabase(REMOTE)).toBe(false);
    expect(isLocalDatabase('postgresql://u:p@localhost.example.com/db')).toBe(
      false
    );
  });
});

describe('adminCredentials', () => {
  it('uses the default login for a local database', () => {
    expect(adminCredentials({ POSTGRES_PRISMA_URL: LOCAL })).toEqual({
      email: 'admin@admin.admin',
      password: 'AdminPassword123',
    });
  });

  it('refuses the default password for a remote or missing database URL', () => {
    expect(() => adminCredentials({ POSTGRES_PRISMA_URL: REMOTE })).toThrow(
      'SEED_ADMIN_PASSWORD'
    );
    expect(() => adminCredentials({})).toThrow('SEED_ADMIN_PASSWORD');
    expect(() =>
      adminCredentials({ POSTGRES_PRISMA_URL: REMOTE, SEED_ADMIN_PASSWORD: '' })
    ).toThrow('SEED_ADMIN_PASSWORD');
  });

  it('uses the configured login when given', () => {
    expect(
      adminCredentials({
        POSTGRES_PRISMA_URL: REMOTE,
        SEED_ADMIN_EMAIL: ' boss@example.com ',
        SEED_ADMIN_PASSWORD: 'secret',
      })
    ).toEqual({ email: 'boss@example.com', password: 'secret' });
  });
});
