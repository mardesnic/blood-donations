import { NextRequest, NextResponse } from 'next/server';
import DonationService from './service';
import { parsePagination, parseSort, withAuth } from '@/lib/api';
import { donationSchema, parseBody } from '@/lib/schemas';

const SORT_FIELDS = ['donor', 'donationDate', 'createdAt'] as const;

export const GET = withAuth(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const donorId = searchParams.get('donorId') || '';
  const actionId = searchParams.get('actionId') || '';

  const { take, skip } = parsePagination(
    searchParams.get('page'),
    searchParams.get('pageSize')
  );
  const { sortField, sort } = parseSort(
    searchParams.get('sort'),
    SORT_FIELDS,
    'createdAt'
  );

  const [donations, count] = await DonationService.find(
    donorId,
    actionId,
    take,
    skip,
    sortField,
    sort
  );
  return NextResponse.json({ donations, count });
});

export const POST = withAuth(async (req: NextRequest, _, user) => {
  const data = await parseBody(donationSchema, await req.json());
  const newDonation = await DonationService.create({
    ...data,
    createdById: user.id,
  });
  return NextResponse.json(newDonation);
});
