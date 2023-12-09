import { NextRequest, NextResponse } from 'next/server';
import PlaceService from '../service';
import { Place } from '@prisma/client';

export async function PUT(
  req: NextRequest,
  contex: { params: { id: string } }
) {
  const id = contex.params.id;
  const body = await req.json();
  const data: Partial<Place> = {
    title: body?.title || '',
    address: body?.address || '',
    city: body?.city || '',
    phone: body?.phone || '',
    email: body?.email || '',
    contactName: body?.contactName || '',
    note: body?.note || '',
  };
  const place = await PlaceService.update(id, data);
  return NextResponse.json(place);
}

export async function DELETE(
  _: NextRequest,
  contex: { params: { id: string } }
) {
  const id = contex.params.id;
  await PlaceService.delete(id);
  return NextResponse.json({ message: `Successfully deleted place ${id}.` });
}
