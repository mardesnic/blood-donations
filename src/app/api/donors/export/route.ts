import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';
import DonorService from '../service';
import { DONOR_SORT_FIELDS, parseSort, withAuth } from '@/lib/api';
import { toXlsx, xlsxResponseInit } from '@/lib/excel';

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
  const { columns, rows } = await DonorService.generateExport(
    search,
    filters,
    sortField,
    sort,
    t
  );

  const fileName = t('export.fileName');
  return new NextResponse(
    new Uint8Array(await toXlsx(columns, rows, fileName)),
    xlsxResponseInit(fileName)
  );
});
