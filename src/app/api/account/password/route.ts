import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcrypt';
import { ValidationError } from 'yup';
import { prisma } from '@/db';
import UserService from '@/app/api/users/service';
import { ForbiddenError, withAuth } from '@/lib/api';
import { passwordProblem } from '@/lib/users';

// The signed-in user's own password: { currentPassword, newPassword }.
// Also works with a temporary password, which is what it replaces.
export const PUT = withAuth(
  async (req: NextRequest, _, user) => {
    const body = (await req.json()) as Record<string, unknown> | null;
    const currentPassword =
      typeof body?.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword =
      typeof body?.newPassword === 'string' ? body.newPassword : '';

    const { password } = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { password: true },
    });
    if (!(await compare(currentPassword, password))) {
      throw new ForbiddenError(
        'The current password is wrong.',
        'WRONG_PASSWORD'
      );
    }
    const problem = passwordProblem(newPassword);
    if (problem) {
      throw new ValidationError(problem);
    }
    if (newPassword === currentPassword) {
      throw new ValidationError('SAME_PASSWORD');
    }
    await UserService.changePassword(user.id, newPassword);
    return NextResponse.json({ ok: true });
  },
  { allowTemporaryPassword: true }
);
