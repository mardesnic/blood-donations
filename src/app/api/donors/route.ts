import { NextRequest, NextResponse } from 'next/server';
import DonorService from './service';
import { Donor } from '@prisma/client';
import { PAGE_SIZE } from '@/lib/const';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const page = searchParams.get('page') || 0;
  const pageSize = searchParams.get('pageSize') || PAGE_SIZE;
  const search =
    searchParams?.get('search')?.split('|')?.map(String)?.filter(Boolean) || [];
  let filters = [];
  const filterString = searchParams?.get('filter') || '';
  if (filterString) {
    filters = JSON.parse(filterString);
    // TODO: figure out column filters, only search implemented for now
    console.log('filumn filters', filters);
  }
  const take = parseInt(pageSize.toString(), 10);
  const skip = parseInt(page.toString(), 10) * take;
  const { donors, count } = await DonorService.find(take, skip, search);
  return NextResponse.json({ donors, count });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const donor: Partial<Donor> = {
    firstName: body?.firstName || '',
    lastName: body?.lastName || '',
    fullName: `${body?.firstName || ''} ${body?.lastName || ''}`,
    fatherName: body?.fatherName || '',
    email: body?.email || '',
    phone: body?.phone || '',
    dob: body?.dob || '',
    oib: body?.oib || '',
    address: body?.address || '',
    city: body?.city || '',
    gender: body?.gender || '',
    bloodType: body?.bloodType || '',
    donationCount: body?.donationCount || 0,
    lastDonation: body?.lastDonation || '',
    active: body?.active || true,
    note: body?.note || '',
  };
  const newDonor = await DonorService.create(donor);
  return NextResponse.json(newDonor);
}
