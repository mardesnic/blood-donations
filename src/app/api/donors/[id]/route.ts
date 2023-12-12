import { NextRequest, NextResponse } from 'next/server';
import DonorService from '../service';
import { Donor } from '@prisma/client';
import { getDateFromDateTime } from '@/lib/utils';

export async function PUT(
  req: NextRequest,
  contex: { params: { id: string } }
) {
  const id = contex.params.id;
  const body = await req.json();
  const lastDonationDate = body?.lastDonation
    ? getDateFromDateTime(body?.lastDonation)
    : undefined;
  const dob = body?.dob ? getDateFromDateTime(body?.dob) : undefined;
  const data: Partial<Donor> = {
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
  const donor = await DonorService.update(id, data);
  return NextResponse.json(donor);
}

export async function DELETE(
  _: NextRequest,
  contex: { params: { id: string } }
) {
  const id = contex.params.id;
  await DonorService.delete(id);
  return NextResponse.json({ message: `Successfully deleted donor ${id}.` });
}
