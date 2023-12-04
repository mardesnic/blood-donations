import { NextRequest, NextResponse } from 'next/server';
import ActionService from '../service';

export async function PUT(
  req: NextRequest,
  contex: { params: { id: string } }
) {
  const id = contex.params.id;
  const body = await req.json();
  const data = {
    title: body?.title,
  };
  const action = await ActionService.update(id, data);
  return NextResponse.json(action);
}

export async function DELETE(
  _: NextRequest,
  contex: { params: { id: string } }
) {
  const id = contex.params.id;
  await ActionService.delete(id);
  return NextResponse.json({ message: `Successfully deleted action ${id}.` });
}
