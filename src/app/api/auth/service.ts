import { Session, getServerSession } from 'next-auth';
import { prisma } from '@/db';
import { STAFF_ROLES } from '@/lib/users';
import { authOptions } from './[...nextauth]/authOptions';

export async function getCurrentSession(): Promise<Session | null> {
  // getting session on server
  return getServerSession(authOptions);
}

const CURRENT_USER_FIELDS = {
  id: true,
  email: true,
  name: true,
  role: true,
  mustChangePassword: true,
} as const;

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: (typeof STAFF_ROLES)[number];
  mustChangePassword: boolean;
};

// The signed-in staff user, read from the database on every call so that
// deactivating someone or changing their role applies at once. Null for no
// session, a deactivated or deleted user, or a role that isn't staff.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const id = (await getCurrentSession())?.user?.id;
  if (!id) {
    return null;
  }
  return prisma.user.findFirst({
    where: { id, active: true, role: { in: [...STAFF_ROLES] } },
    select: CURRENT_USER_FIELDS,
  });
}
