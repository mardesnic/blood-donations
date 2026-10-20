import { NextRequest, NextResponse } from 'next/server';
import UserService from '../../service';
import { withAuth } from '@/lib/api';

// A new temporary password for someone who forgot theirs: { temporaryPassword }
export const POST = withAuth(
  async (
    _: NextRequest,
    context: { params: Promise<{ id: string }> },
    user
  ) => {
    const { id } = await context.params;
    return NextResponse.json(await UserService.resetPassword(id, user.id));
  },
  { admin: true }
);
