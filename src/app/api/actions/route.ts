import { NextRequest, NextResponse } from 'next/server';
import ActionService from './service';
import { PAGE_SIZE } from '@/lib/const';
import { generateSortFieldsFromSortString } from '@/lib/utils';
import { Action } from '@prisma/client';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const page = searchParams.get('page') || 0;
  const pageSize = searchParams.get('pageSize') || PAGE_SIZE;

  const placeId = searchParams.get('placeId') || '';

  const take = parseInt(pageSize.toString(), 10);
  const skip = parseInt(page.toString(), 10) * take;
  const { sortField, sort } = generateSortFieldsFromSortString(
    searchParams?.get('sort') || ''
  );
  const [actions, count] = await ActionService.find(
    placeId,
    take,
    skip,
    sortField as keyof Action,
    sort
  );
  return NextResponse.json({ actions, count });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newAction = await ActionService.create(body);
  return NextResponse.json(newAction);
}
