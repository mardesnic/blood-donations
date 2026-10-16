import { NextRequest, NextResponse } from 'next/server';
import PlaceService from '../service';
import { Place } from '@prisma/client';
import { withAuth } from '@/lib/api';

export const PUT = withAuth(
  async (req: NextRequest, contex: { params: Promise<{ id: string }> }) => {
    const { id } = await contex.params;
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
);

export const DELETE = withAuth(
  async (_: NextRequest, contex: { params: Promise<{ id: string }> }) => {
    const { id } = await contex.params;
    await PlaceService.delete(id);
    return NextResponse.json({ message: `Successfully deleted place ${id}.` });
  }
);
