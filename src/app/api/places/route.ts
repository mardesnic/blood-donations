import { NextRequest, NextResponse } from 'next/server';
import PlaceService from './service';
import { Place } from '@prisma/client';
import {
  generateFilterFieldsFromFilterString,
  generateSortFieldsFromSortString,
} from '@/lib/utils';
import { PAGE_SIZE } from '@/lib/const';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const page = searchParams.get('page') || 0;
  const pageSize = searchParams.get('pageSize') || PAGE_SIZE;
  const search = searchParams?.get('search') || '';
  const { filterField, filterOperator, filterTerm } =
    generateFilterFieldsFromFilterString(searchParams?.get('filter') || '');
  const { sortField, sort } = generateSortFieldsFromSortString(
    searchParams?.get('sort') || ''
  );
  const take = parseInt(pageSize.toString(), 10);
  const skip = parseInt(page.toString(), 10) * take;
  const { places, count } = await PlaceService.find(
    take,
    skip,
    search,
    filterField as keyof Place,
    filterOperator,
    filterTerm,
    sortField as keyof Place,
    sort
  );
  return NextResponse.json({ places, count });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const place: Partial<Place> = {
    title: body?.title || '',
    address: body?.address || '',
    city: body?.city || '',
    phone: body?.phone || '',
    email: body?.email || '',
    contactName: body?.contactName || '',
    note: body?.note || '',
  };
  const newPlace = await PlaceService.create(place);
  return NextResponse.json(newPlace);
}
