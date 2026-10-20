import { NextRequest, NextResponse } from 'next/server';
import DonorService from '../service';
import { donorDataFromBody } from '../body';
import { withAuth } from '@/lib/api';

export const PUT = withAuth(
  async (req: NextRequest, contex: { params: Promise<{ id: string }> }) => {
    const { id } = await contex.params;
    const donor = await DonorService.update(
      id,
      donorDataFromBody(await req.json())
    );
    return NextResponse.json(donor);
  }
);

// Only admins delete.
export const DELETE = withAuth(
  async (_: NextRequest, contex: { params: Promise<{ id: string }> }) => {
    const { id } = await contex.params;
    await DonorService.delete(id);
    return NextResponse.json({ message: `Successfully deleted donor ${id}.` });
  },
  { admin: true }
);
