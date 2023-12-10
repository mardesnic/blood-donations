import { NextRequest, NextResponse } from 'next/server';
import DonationService from './service';

export async function GET() {
  const donations = await DonationService.find();
  return NextResponse.json(donations);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newDonation = await DonationService.create(body);
  return NextResponse.json(newDonation);
}
