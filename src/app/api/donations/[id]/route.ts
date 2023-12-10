import { NextRequest, NextResponse } from 'next/server';
import DonationService from '../service';

export async function PUT(
  req: NextRequest,
  contex: { params: { id: string } }
) {
  const id = contex.params.id;
  const body = await req.json();

  const donation = await DonationService.update(id, body);
  return NextResponse.json(donation);
}

export async function DELETE(
  _: NextRequest,
  contex: { params: { id: string } }
) {
  const id = contex.params.id;
  await DonationService.delete(id);
  return NextResponse.json({ message: `Successfully deleted donation ${id}.` });
}
