import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { ValidationError } from 'yup';
import { CurrentUser, getCurrentUser } from '@/app/api/auth/service';
import {
  DONOR_SORT_FIELDS,
  parsePagination,
  parseSort,
  withAuth,
} from '@/lib/api';
import { MAX_PAGE_SIZE, PAGE_SIZE } from '@/lib/const';

vi.mock('@/app/api/auth/service', () => ({
  getCurrentUser: vi.fn(),
}));

const mockedUser = vi.mocked(getCurrentUser);
const user = (overrides: Partial<CurrentUser> = {}): CurrentUser => ({
  id: 'u1',
  email: 'ana@example.com',
  name: 'Ana',
  role: 'VOLUNTEER',
  mustChangePassword: false,
  ...overrides,
});
const request = () => new NextRequest('http://localhost/api/donors');

describe('withAuth', () => {
  it('returns 401 without an active user and does not call the handler', async () => {
    mockedUser.mockResolvedValue(null);
    const handler = vi.fn();
    const res = await withAuth(handler)(request(), {});
    expect(res.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it('calls the handler with the user', async () => {
    mockedUser.mockResolvedValue(user());
    const res = await withAuth(async () => Response.json({ ok: true }))(
      request(),
      {}
    );
    expect(res.status).toBe(200);
  });

  it('passes the user to the handler', async () => {
    mockedUser.mockResolvedValue(user());
    const handler = vi.fn(async () => Response.json({}));
    await withAuth(handler)(request(), {});
    expect(handler).toHaveBeenCalledWith(expect.anything(), {}, user());
  });

  it('refuses admin-only routes to volunteers with 403', async () => {
    mockedUser.mockResolvedValue(user());
    const handler = vi.fn();
    const res = await withAuth(handler, { admin: true })(request(), {});
    expect(res.status).toBe(403);
    expect((await res.json()).code).toBe('ADMIN_ONLY');
    expect(handler).not.toHaveBeenCalled();

    mockedUser.mockResolvedValue(user({ role: 'ADMIN' }));
    const ok = await withAuth(async () => Response.json({}), {
      admin: true,
    })(request(), {});
    expect(ok.status).toBe(200);
  });

  it('allows only the password change with a temporary password', async () => {
    mockedUser.mockResolvedValue(user({ mustChangePassword: true }));
    const res = await withAuth(async () => Response.json({}))(request(), {});
    expect(res.status).toBe(403);
    expect((await res.json()).code).toBe('PASSWORD_CHANGE_REQUIRED');
    const ok = await withAuth(async () => Response.json({}), {
      allowTemporaryPassword: true,
    })(request(), {});
    expect(ok.status).toBe(200);
  });

  it('maps validation errors to 400', async () => {
    mockedUser.mockResolvedValue(user());
    const res = await withAuth(async () => {
      throw new ValidationError('title is required');
    })(request(), {});
    expect(res.status).toBe(400);
  });

  it('maps invalid JSON to 400', async () => {
    mockedUser.mockResolvedValue(user());
    const res = await withAuth(async () => {
      JSON.parse('{');
      return Response.json({});
    })(request(), {});
    expect(res.status).toBe(400);
  });

  it('hides unexpected errors behind a generic 500', async () => {
    mockedUser.mockResolvedValue(user());
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await withAuth(async () => {
      throw new Error('connection string with password');
    })(request(), {});
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ message: 'Internal server error.' });
  });
});

describe('parsePagination', () => {
  it('uses defaults for null, undefined and empty input', () => {
    const expected = { take: PAGE_SIZE, skip: 0 };
    expect(parsePagination(null, null)).toEqual(expected);
    expect(parsePagination(undefined, undefined)).toEqual(expected);
    expect(parsePagination('', '')).toEqual(expected);
  });

  it('computes skip from page and page size', () => {
    expect(parsePagination('2', '25')).toEqual({ take: 25, skip: 50 });
  });

  it('caps the page size', () => {
    expect(parsePagination('0', '1000000').take).toBe(MAX_PAGE_SIZE);
  });

  it('ignores negative and non-numeric values', () => {
    expect(parsePagination('-1', '-5')).toEqual({ take: PAGE_SIZE, skip: 0 });
    expect(parsePagination('abc', '1.5')).toEqual({
      take: PAGE_SIZE,
      skip: 0,
    });
  });
});

describe('parseSort', () => {
  it('uses the default for null, undefined and empty input', () => {
    for (const input of [null, undefined, '']) {
      expect(parseSort(input, DONOR_SORT_FIELDS, 'createdAt')).toEqual({
        sortField: 'createdAt',
        sort: 'desc',
      });
    }
  });

  it('accepts an allowed field', () => {
    expect(parseSort('fullName|asc', DONOR_SORT_FIELDS, 'createdAt')).toEqual({
      sortField: 'fullName',
      sort: 'asc',
    });
  });

  it('falls back for a field that is not allowed', () => {
    expect(parseSort('password|asc', DONOR_SORT_FIELDS, 'createdAt')).toEqual({
      sortField: 'createdAt',
      sort: 'asc',
    });
  });
});
