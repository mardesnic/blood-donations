import { NextRequest, NextResponse } from 'next/server';
import PlaceService from './service';

export async function GET() {
  const places = await PlaceService.find();
  return NextResponse.json(places);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const place = {
    title: body?.title || '',
  };
  const newPlace = await PlaceService.create(place);
  return NextResponse.json(newPlace);
}
