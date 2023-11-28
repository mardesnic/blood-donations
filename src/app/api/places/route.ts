import { NextResponse } from 'next/server';
import PlaceService from './service';

export async function GET() {
  const places = await PlaceService.find();
  return NextResponse.json(places);
}
