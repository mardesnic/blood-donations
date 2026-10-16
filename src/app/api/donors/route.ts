import { NextRequest, NextResponse } from 'next/server';
import DonorService from './service';
import { donorDataFromBody } from './body';
import {
  DONOR_SORT_FIELDS,
  parsePagination,
  parseSort,
  withAuth,
} from '@/lib/api';

export const GET = withAuth(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;

  const search = searchParams?.get('search') || '';
  const filters = searchParams?.getAll('filter') || [];

  const { take, skip } = parsePagination(
    searchParams.get('page'),
    searchParams.get('pageSize')
  );
  const { sortField, sort } = parseSort(
    searchParams.get('sort'),
    DONOR_SORT_FIELDS,
    'createdAt'
  );
  const { donors, count } = await DonorService.find(
    take,
    skip,
    search,
    filters,
    sortField,
    sort
  );
  return NextResponse.json({ donors, count });
});

export const POST = withAuth(async (req: NextRequest) => {
  const newDonor = await DonorService.create(
    donorDataFromBody(await req.json())
  );
  return NextResponse.json(newDonor);
});
