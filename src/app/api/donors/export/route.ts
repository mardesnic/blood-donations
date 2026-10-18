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
  const t = await getTranslations();
  const csvString = await DonorService.generateExport(
    search,
    filters,
    sortField,
    sort,
    t
  );

  // The byte-order mark makes Excel read the file as UTF-8, so letters
  // such as č, ć and ž come out right.
  return new NextResponse(`\uFEFF${csvString}`, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename=${t('export.fileName')}.csv`,
    },
  });
});
