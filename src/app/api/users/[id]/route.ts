import { NextRequest, NextResponse } from 'next/server';
import UserService from '../service';
import { withAuth } from '@/lib/api';
import { parseBody, userSchema } from '@/lib/schemas';

// { name, email, role, active }. Users are deactivated, never deleted, so
// their name stays on what they recorded.
export const PUT = withAuth(
  async (
    req: NextRequest,
    context: { params: Promise<{ id: string }> },
    user
  ) => {
    const { id } = await context.params;
    const data = await parseBody(userSchema, await req.json());
    return NextResponse.json(await UserService.update(id, data, user.id));
  },
  { admin: true }
);
