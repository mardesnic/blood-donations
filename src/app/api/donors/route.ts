import { NextRequest, NextResponse } from 'next/server';
import DonorService from './service';
import { Donor } from '@prisma/client';

export async function GET() {
  const donors = await DonorService.find();
  return NextResponse.json(donors);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const donor: Partial<Donor> = {
    firstName: body?.firstName || '',
    lastName: body?.lastName || '',
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
