import { NextRequest, NextResponse } from 'next/server';
import ActionService from '../service';
import { withAuth } from '@/lib/api';
import { actionSchema, parseBody } from '@/lib/schemas';

export const PUT = withAuth(
  async (req: NextRequest, contex: { params: { id: string } }) => {
    const id = contex.params.id;
    const data = await parseBody(actionSchema, await req.json());

    const action = await ActionService.update(id, data);
    return NextResponse.json(action);
  }
);

export const DELETE = withAuth(
  async (_: NextRequest, contex: { params: { id: string } }) => {
    const id = contex.params.id;
    await ActionService.delete(id);
    return NextResponse.json({ message: `Successfully deleted action ${id}.` });
  }
);
