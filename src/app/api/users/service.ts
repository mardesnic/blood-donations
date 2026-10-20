import { hash } from 'bcrypt';
import { InferType } from 'yup';
import { prisma } from '@/db';
import { Prisma } from '@/generated/prisma/client';
import { ConflictError } from '@/lib/api';
import { userSchema } from '@/lib/schemas';
import { generateTempPassword } from '@/lib/users';

type UserInput = InferType<typeof userSchema>;

const BCRYPT_ROUNDS = 12;

// Never the password hash.
const USER_FIELDS = {
  id: true,
  email: true,
  name: true,
  role: true,
  active: true,
  mustChangePassword: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

export type UserListItem = Prisma.UserGetPayload<{
  select: typeof USER_FIELDS;
}>;

function isDuplicateEmail(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

const duplicateEmail = () =>
  new ConflictError('A user with this email exists.', 'DUPLICATE_EMAIL');

export default class UserService {
  // Active users first, then by name.
  static async find(): Promise<UserListItem[]> {
    return prisma.user.findMany({
      select: USER_FIELDS,
      orderBy: [{ active: 'desc' }, { name: 'asc' }, { email: 'asc' }],
    });
  }

  // A new user with a temporary password, returned once so the admin can
  // pass it on; they must replace it after signing in.
  static async create(data: UserInput) {
    const temporaryPassword = generateTempPassword();
    try {
      const user = await prisma.user.create({
        data: {
          ...data,
          password: await hash(temporaryPassword, BCRYPT_ROUNDS),
          mustChangePassword: true,
        },
        select: USER_FIELDS,
      });
      return { user, temporaryPassword };
    } catch (error) {
      throw isDuplicateEmail(error) ? duplicateEmail() : error;
    }
  }

  // Admins can't change their own role or deactivate themselves, so the
  // admin making changes always stays, and there is always an active admin.
  static async update(id: string, data: UserInput, currentUserId: string) {
    if (id === currentUserId) {
      const self = await prisma.user.findUniqueOrThrow({ where: { id } });
      if (data.role !== self.role || !data.active) {
        throw new ConflictError(
          "You can't change your own role or deactivate yourself.",
          'SELF_CHANGE'
        );
      }
    }
    try {
      return await prisma.user.update({
        where: { id },
        data,
        select: USER_FIELDS,
      });
    } catch (error) {
      throw isDuplicateEmail(error) ? duplicateEmail() : error;
    }
  }

  static async resetPassword(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new ConflictError(
        'Change your own password in your account instead.',
        'SELF_CHANGE'
      );
    }
    const temporaryPassword = generateTempPassword();
    await prisma.user.update({
      where: { id },
      data: {
        password: await hash(temporaryPassword, BCRYPT_ROUNDS),
        mustChangePassword: true,
      },
    });
    return { temporaryPassword };
  }

  static async changePassword(id: string, password: string) {
    await prisma.user.update({
      where: { id },
      data: {
        password: await hash(password, BCRYPT_ROUNDS),
        mustChangePassword: false,
      },
    });
  }
}
