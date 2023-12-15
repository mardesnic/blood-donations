import { NextRequest, NextResponse } from 'next/server';
import DonorService from '../service';
import { Donor } from '@prisma/client';
import {
  generateFilterFieldsFromFilterString,
  generateSortFieldsFromSortString,
} from '@/lib/utils';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams?.get('search') || '';
  const { filterField, filterOperator, filterTerm } =
    generateFilterFieldsFromFilterString(searchParams?.get('filter') || '');
  const { sortField, sort } = generateSortFieldsFromSortString(
    searchParams?.get('sort') || ''
  );
  const csvString = await DonorService.generateExport(
    search,
    filterField as keyof Donor,
    filterOperator,
    filterTerm,
    sortField as keyof Donor,
    sort
  );

  return new NextResponse(csvString, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=donors.csv`,
    },
  });
}
