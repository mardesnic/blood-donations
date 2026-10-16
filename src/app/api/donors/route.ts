import { NextRequest, NextResponse } from 'next/server';
import DonorService from './service';
import { Donor } from '@prisma/client';
import { getDateFromDateTime } from '@/lib/utils';
import {
  DONOR_SORT_FIELDS,
  parsePagination,
  parseSort,
  withAuth,
} from '@/lib/api';

export const GET = withAuth(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;

  const search = searchParams?.get('search') || '';
  const filters = searchParams?.getAll('filter') || [];

  const { take, skip } = parsePagination(
    searchParams.get('page'),
    searchParams.get('pageSize')
  );
  const { sortField, sort } = parseSort(
    searchParams.get('sort'),
    DONOR_SORT_FIELDS,
    'createdAt'
  );
  const { donors, count } = await DonorService.find(
    take,
    skip,
    search,
    filters,
    sortField,
    sort
  );
  return NextResponse.json({ donors, count });
});

export const POST = withAuth(async (req: NextRequest) => {
  const body = await req.json();
  const lastDonationDate = body?.lastDonation
    ? getDateFromDateTime(body?.lastDonation)
    : undefined;
  const dob = body?.dob ? getDateFromDateTime(body?.dob) : undefined;
  const donor: Partial<Donor> = {
    firstName: body?.firstName || '',
    lastName: body?.lastName || '',
    fullName: `${body?.firstName || ''} ${body?.lastName || ''}`,
    fatherName: body?.fatherName || '',
    email: body?.email || '',
    phone: body?.phone || '',
    dob,
    oib: body?.oib || '',
    address: body?.address || '',
    city: body?.city || '',
    gender: body?.gender || '',
    bloodType: body?.bloodType || '',
    donationCount: body?.donationCount || 0,
    lastDonation: lastDonationDate,
    active: body?.active || true,
    note: body?.note || '',
  };
  const newDonor = await DonorService.create(donor);
  return NextResponse.json(newDonor);
});
