import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { ValidationError } from 'yup';
import { getCurrentSession } from '@/app/api/auth/service';
import {
  DONOR_SORT_FIELDS,
  MAX_PAGE_SIZE,
  parsePagination,
  parseSort,
  withAuth,
} from '@/lib/api';
import { PAGE_SIZE } from '@/lib/const';

vi.mock('@/app/api/auth/service', () => ({
  getCurrentSession: vi.fn(),
}));

const mockedSession = vi.mocked(getCurrentSession);
const request = () => new NextRequest('http://localhost/api/donors');

describe('withAuth', () => {
  it('returns 401 without a session and does not call the handler', async () => {
    mockedSession.mockResolvedValue(null);
    const handler = vi.fn();
    const res = await withAuth(handler)(request(), {});
    expect(res.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it('calls the handler with a session', async () => {
    mockedSession.mockResolvedValue({ expires: '' });
    const res = await withAuth(async () => Response.json({ ok: true }))(
      request(),
      {}
    );
    expect(res.status).toBe(200);
  });

  it('maps validation errors to 400', async () => {
    mockedSession.mockResolvedValue({ expires: '' });
    const res = await withAuth(async () => {
      throw new ValidationError('title is required');
    })(request(), {});
    expect(res.status).toBe(400);
  });

  it('maps invalid JSON to 400', async () => {
    mockedSession.mockResolvedValue({ expires: '' });
    const res = await withAuth(async () => {
      JSON.parse('{');
      return Response.json({});
    })(request(), {});
    expect(res.status).toBe(400);
  });

  it('hides unexpected errors behind a generic 500', async () => {
    mockedSession.mockResolvedValue({ expires: '' });
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
