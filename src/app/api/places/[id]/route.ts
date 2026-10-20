import { NextRequest, NextResponse } from 'next/server';
import PlaceService from '../service';
import { withAuth } from '@/lib/api';
import { parseBody, placeSchema } from '@/lib/schemas';

export const PUT = withAuth(
  async (req: NextRequest, contex: { params: Promise<{ id: string }> }) => {
    const { id } = await contex.params;
    const data = await parseBody(placeSchema, await req.json());
    const place = await PlaceService.update(id, data);
    return NextResponse.json(place);
  }
);

// Only admins delete.
export const DELETE = withAuth(
  async (_: NextRequest, contex: { params: Promise<{ id: string }> }) => {
    const { id } = await contex.params;
    await PlaceService.delete(id);
    return NextResponse.json({ message: `Successfully deleted place ${id}.` });
  },
  { admin: true }
);
