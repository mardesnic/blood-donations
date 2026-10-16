import { NextRequest, NextResponse } from 'next/server';
import ActionService from './service';
import { parsePagination, parseSort, withAuth } from '@/lib/api';
import { actionSchema, parseBody } from '@/lib/schemas';

const SORT_FIELDS = [
  'title',
  'startDateTime',
  'endDateTime',
  'donationCount',
  'note',
  'createdAt',
] as const;

export const GET = withAuth(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const placeId = searchParams.get('placeId') || '';

  const { take, skip } = parsePagination(
    searchParams.get('page'),
    searchParams.get('pageSize')
  );
  const { sortField, sort } = parseSort(
    searchParams.get('sort'),
    SORT_FIELDS,
    'createdAt'
  );
  const [actions, count] = await ActionService.find(
    placeId,
    take,
    skip,
    sortField,
    sort
  );
  return NextResponse.json({ actions, count });
});

export const POST = withAuth(async (req: NextRequest) => {
  const data = await parseBody(actionSchema, await req.json());
  const newAction = await ActionService.create(data);
  return NextResponse.json(newAction);
});
