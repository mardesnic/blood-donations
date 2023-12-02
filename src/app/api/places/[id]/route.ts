import { NextRequest, NextResponse } from 'next/server';
import PlaceService from '../service';

export async function PUT(
  req: NextRequest,
  contex: { params: { id: string } }
) {
  const id = contex.params.id;
  const body = await req.json();
  const data = {
    title: body?.title,
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
