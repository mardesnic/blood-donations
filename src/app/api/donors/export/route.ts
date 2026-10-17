import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';
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
  // In the language the user sees the app in.
  const csvString = await DonorService.generateExport(
    search,
    filters,
    sortField,
    sort,
    {
      headers: await getTranslations('export'),
      eligibility: await getTranslations('eligibility'),
    }
  );

  return new NextResponse(csvString, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=donors.csv`,
    },
  });
});
