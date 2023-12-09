import { NextRequest, NextResponse } from 'next/server';
import PlaceService from './service';
import { Place } from '@prisma/client';

export async function GET() {
  const places = await PlaceService.find();
  return NextResponse.json(places);
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
