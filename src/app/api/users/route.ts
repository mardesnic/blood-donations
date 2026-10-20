import { NextRequest, NextResponse } from 'next/server';
import UserService from './service';
import { withAuth } from '@/lib/api';
import { parseBody, userSchema } from '@/lib/schemas';

// Managing users is for admins only.
export const GET = withAuth(
  async () => NextResponse.json({ users: await UserService.find() }),
  { admin: true }
);

// { name, email, role } -> { user, temporaryPassword }
export const POST = withAuth(
  async (req: NextRequest) => {
    const data = await parseBody(userSchema, await req.json());
    return NextResponse.json(await UserService.create(data));
  },
  { admin: true }
);
