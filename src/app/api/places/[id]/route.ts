import { NextRequest, NextResponse } from 'next/server';
import PlaceService from '../service';

export async function DELETE(
  _: NextRequest,
  contex: { params: { id: string } }
) {
  const id = contex.params.id;
  await PlaceService.delete(id);
  return NextResponse.json({ message: `Successfully deleted place ${id}.` });
}
