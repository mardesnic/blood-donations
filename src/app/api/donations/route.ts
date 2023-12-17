import { NextRequest, NextResponse } from 'next/server';
import DonationService from './service';
import { PAGE_SIZE } from '@/lib/const';
import { generateSortFieldsFromSortString } from '@/lib/utils';
import { Donation } from '@prisma/client';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const page = searchParams.get('page') || 0;
  const pageSize = searchParams.get('pageSize') || PAGE_SIZE;

  const donorId = searchParams.get('donorId') || '';
  const actionId = searchParams.get('actionId') || '';

  const take = parseInt(pageSize.toString(), 10);
  const skip = parseInt(page.toString(), 10) * take;
  const { sortField, sort } = generateSortFieldsFromSortString(
    searchParams?.get('sort') || ''
  );
  const [donations, count] = await DonationService.find(
    donorId,
    actionId,
    take,
    skip,
    sortField as keyof Donation,
    sort
  );
  return NextResponse.json({ donations, count });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newDonation = await DonationService.create(body);
  return NextResponse.json(newDonation);
}
