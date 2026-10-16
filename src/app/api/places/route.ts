import { NextRequest, NextResponse } from 'next/server';
import PlaceService from './service';
import { Place } from '@/generated/prisma/client';
import { generateFilterFieldsFromFilterString } from '@/lib/utils';
import { parsePagination, parseSort, withAuth } from '@/lib/api';
import { parseBody, placeSchema } from '@/lib/schemas';

const SORT_FIELDS = [
  'title',
  'address',
  'city',
  'phone',
  'email',
  'contactName',
  'createdAt',
] as const;

export const GET = withAuth(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams?.get('search') || '';
  const { filterField, filterOperator, filterTerm } =
    generateFilterFieldsFromFilterString(searchParams?.get('filter') || '');
  const { take, skip } = parsePagination(
    searchParams.get('page'),
    searchParams.get('pageSize')
  );
  const { sortField, sort } = parseSort(
    searchParams.get('sort'),
    SORT_FIELDS,
    'createdAt'
  );
  const { places, count } = await PlaceService.find(
    take,
    skip,
    search,
    filterField as keyof Place,
    filterOperator,
    filterTerm,
    sortField,
    sort
  );
  return NextResponse.json({ places, count });
});

export const POST = withAuth(async (req: NextRequest) => {
  const data = await parseBody(placeSchema, await req.json());
  const newPlace = await PlaceService.create(data);
  return NextResponse.json(newPlace);
});
