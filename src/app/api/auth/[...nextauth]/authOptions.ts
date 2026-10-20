import { prisma } from '@/db';
import { ROUTE_PATHS } from '@/routes';
import { compare } from 'bcrypt';
import { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { FailureLimiter } from '@/lib/rateLimit';
import { TOO_MANY_ATTEMPTS } from '@/lib/const';
import { isStaffRole, normalizeEmail } from '@/lib/users';

// Failed sign-ins allowed per 15 minutes before further attempts are refused.
const WINDOW_MS = 15 * 60 * 1000;
const failuresByEmail = new FailureLimiter(5, WINDOW_MS);
const failuresByIp = new FailureLimiter(20, WINDOW_MS);

// bcrypt hash of a random string nobody knows; never matches a password.
const DUMMY_HASH =
  '$2b$12$D8FnTSjgtPsU06Y1KdrGYeWdcJ6ro9E54UCRXwqfLAmeZNM8kyHoy';

function clientIp(
  headers: Record<string, string | string[] | undefined> | undefined
): string | null {
  const forwarded = headers?.['x-forwarded-for'];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return value?.split(',')[0]?.trim() || null;
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: ROUTE_PATHS.PUBLIC.LOGIN.path,
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email' },
        password: { label: 'Password' },
      },
      authorize: async (credentials, req) => {
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }
        // Stored lower-cased, so "A@x" signs in as "a@x" and shares its
        // failure counter.
        const email = normalizeEmail(credentials.email);
        const ip = clientIp(req?.headers);
        if (failuresByEmail.isLimited(email) || failuresByIp.isLimited(ip)) {
          throw new Error(TOO_MANY_ATTEMPTS);
        }
        try {
          const user = await prisma.user.findUnique({ where: { email } });

          // Compare against a dummy hash for unknown emails so the response
          // time doesn't reveal which emails have an account.
          const valid = await compare(
            credentials.password,
            user?.password ?? DUMMY_HASH
          );
          // Deactivated users, and any future non-staff role, can't sign in
          // here; they get the same answer as a wrong password.
          if (user && valid && user.active && isStaffRole(user.role)) {
            failuresByEmail.reset(email);
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            });
            return { id: user.id, email: user.email, name: user.name };
          }
        } catch (error) {
          console.warn(error);
          return null;
        }
        failuresByEmail.recordFailure(email);
        failuresByIp.recordFailure(ip);
        return null;
      },
    }),
  ],
  callbacks: {
    // The token carries what the proxy needs without a database lookup:
    // whether the user must replace a temporary password. It is set at
    // sign-in and re-read when the client calls update() after a change.
    // API routes and pages still check the database (getCurrentUser).
    jwt: async ({ token, trigger }) => {
      if ((trigger === 'signIn' || trigger === 'update') && token.sub) {
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { name: true, mustChangePassword: true },
        });
        token.name = user?.name ?? '';
        token.mustChangePassword = !!user?.mustChangePassword;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
        mustChangePassword: !!token.mustChangePassword,
      },
    }),
  },
  session: {
    strategy: 'jwt',
  },
};
