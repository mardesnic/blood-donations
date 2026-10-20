import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma/client';
import { ValidationError } from 'yup';
import { CurrentUser, getCurrentUser } from '@/app/api/auth/service';
import { MAX_PAGE_SIZE, PAGE_SIZE } from '@/lib/const';
import { generateSortFieldsFromSortString } from '@/lib/utils';
import { isAdmin } from '@/lib/users';

// Shared with the donors page, which keeps the sort in its URL.
export { DONOR_SORT_FIELDS } from '@/lib/donorFilterModel';

type RouteHandler<C> = (req: NextRequest, context: C) => Promise<Response>;
// Handlers also get the signed-in user (e.g. to record who logged something).
type AuthedHandler<C> = (
  req: NextRequest,
  context: C,
  user: CurrentUser
) => Promise<Response>;

interface AuthOptions {
  // Admins only (deleting records, managing users).
  admin?: boolean;
  // Also while the user still has a temporary password (to change it).
  allowTemporaryPassword?: boolean;
}

// A request that clashes with existing data (409), with a code the client
// can show a message for.
export class ConflictError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
  }
}

// Not allowed for this user (403), with a code the client can show a
// message for.
export class ForbiddenError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
  }
}

// Rejects requests without an active staff user (401), with a temporary
// password or without the admin role where needed (403), and maps known
// errors to status codes, so API routes don't rely on middleware alone.
export function withAuth<C>(
  handler: AuthedHandler<C>,
  options: AuthOptions = {}
): RouteHandler<C> {
  return async (req, context) => {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }
    if (user.mustChangePassword && !options.allowTemporaryPassword) {
      return NextResponse.json(
        {
          message: 'Change your temporary password first.',
          code: 'PASSWORD_CHANGE_REQUIRED',
        },
        { status: 403 }
      );
    }
    if (options.admin && !isAdmin(user)) {
      return NextResponse.json(
        { message: 'Only admins can do this.', code: 'ADMIN_ONLY' },
        { status: 403 }
      );
    }
    try {
      return await handler(req, context, user);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { message: 'Invalid JSON body.' },
          { status: 400 }
        );
      }
      if (error instanceof ForbiddenError) {
        return NextResponse.json(
          { message: error.message, code: error.code },
          { status: 403 }
        );
      }
      if (error instanceof ConflictError) {
        return NextResponse.json(
          { message: error.message, code: error.code },
          { status: 409 }
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
