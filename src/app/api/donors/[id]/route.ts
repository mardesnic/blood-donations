import { NextRequest, NextResponse } from 'next/server';
import DonorService from '../service';
import { Donor } from '@prisma/client';

export async function PUT(
  req: NextRequest,
  contex: { params: { id: string } }
) {
  const id = contex.params.id;
  const body = await req.json();
  const data: Partial<Donor> = {
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
