import { NextRequest, NextResponse } from 'next/server';
import DonationService from '../service';
import { withAuth } from '@/lib/api';
import { donationSchema, parseBody } from '@/lib/schemas';

export const PUT = withAuth(
  async (req: NextRequest, contex: { params: Promise<{ id: string }> }) => {
    const { id } = await contex.params;
    const data = await parseBody(donationSchema, await req.json());

    const donation = await DonationService.update(id, data);
    return NextResponse.json(donation);
  }
);

// Only admins delete.
export const DELETE = withAuth(
  async (_: NextRequest, contex: { params: Promise<{ id: string }> }) => {
    const { id } = await contex.params;
    await DonationService.delete(id);
    return NextResponse.json({
      message: `Successfully deleted donation ${id}.`,
    });
  },
  { admin: true }
);
