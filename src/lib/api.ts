import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ValidationError } from 'yup';
import { getCurrentSession } from '@/app/api/auth/service';
import { PAGE_SIZE } from '@/lib/const';
import { generateSortFieldsFromSortString } from '@/lib/utils';

export const MAX_PAGE_SIZE = 100;

export const DONOR_SORT_FIELDS = [
  'fullName',
  'oib',
  'bloodType',
  'donationCount',
  'lastDonation',
  'gender',
  'dob',
  'createdAt',
] as const;

type RouteHandler<C> = (req: NextRequest, context: C) => Promise<Response>;

// Rejects requests without a valid session and maps known errors to status
// codes, so API routes don't rely on middleware alone for authentication.
export function withAuth<C>(handler: RouteHandler<C>): RouteHandler<C> {
  return async (req, context) => {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }
    try {
      return await handler(req, context);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { message: 'Invalid JSON body.' },
          { status: 400 }
        );
      }
      if (error instanceof ValidationError) {
        return NextResponse.json(
          { message: 'Invalid request.', errors: error.errors },
          { status: 400 }
        );
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return NextResponse.json({ message: 'Not found.' }, { status: 404 });
      }
      console.error(error);
      return NextResponse.json(
        { message: 'Internal server error.' },
        { status: 500 }
      );
    }
  };
}

function toNonNegativeInt(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

export function parsePagination(
  page: string | null | undefined,
  pageSize: string | null | undefined
): { take: number; skip: number } {
  const take = Math.min(
    Math.max(toNonNegativeInt(pageSize) || PAGE_SIZE, 1),
    MAX_PAGE_SIZE
  );
  const skip = (toNonNegativeInt(page) || 0) * take;
  return { take, skip };
}

export function parseSort<F extends string>(
  sortString: string | null | undefined,
  allowedFields: readonly F[],
  defaultField: F
): { sortField: F; sort: 'asc' | 'desc' } {
  const { sortField, sort } = generateSortFieldsFromSortString(
    sortString || ''
  );
  const field = allowedFields.find((allowed) => allowed === sortField);
  return { sortField: field || defaultField, sort };
}
