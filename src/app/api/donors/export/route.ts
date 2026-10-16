import { NextRequest, NextResponse } from 'next/server';
import DonorService from '../service';
import { DONOR_SORT_FIELDS, parseSort, withAuth } from '@/lib/api';

export const GET = withAuth(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams?.get('search') || '';
  const filters = searchParams?.getAll('filter') || [];

  const { sortField, sort } = parseSort(
    searchParams.get('sort'),
    DONOR_SORT_FIELDS,
    'createdAt'
  );
  const csvString = await DonorService.generateExport(
    search,
    filters,
    sortField,
    sort
  );

  return new NextResponse(csvString, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=donors.csv`,
    },
  });
});
