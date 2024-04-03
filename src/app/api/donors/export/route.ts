import { NextRequest, NextResponse } from 'next/server';
import DonorService from '../service';
import { Donor } from '@prisma/client';
import { generateSortFieldsFromSortString } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams?.get('search') || '';
  const filters = searchParams?.getAll('filter') || [];

  const { sortField, sort } = generateSortFieldsFromSortString(
    searchParams?.get('sort') || ''
  );
  const csvString = await DonorService.generateExport(
    search,
    filters,
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
