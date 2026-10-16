import { prisma } from '@/db';
import { ROUTE_PATHS } from '@/routes';
import { compare } from 'bcrypt';
import { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { FailureLimiter } from '@/lib/rateLimit';
import { TOO_MANY_ATTEMPTS } from '@/lib/const';

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
        // Lower-cased so "A@x" and "a@x" share one failure counter.
        const email = credentials.email.trim().toLowerCase();
        const ip = clientIp(req?.headers);
        if (failuresByEmail.isLimited(email) || failuresByIp.isLimited(ip)) {
          throw new Error(TOO_MANY_ATTEMPTS);
        }
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          // Compare against a dummy hash for unknown emails so the response
          // time doesn't reveal which emails have an account.
          const valid = await compare(
            credentials.password,
            user?.password ?? DUMMY_HASH
          );
          if (user && valid) {
            failuresByEmail.reset(email);
            return user;
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
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
  },
  session: {
    strategy: 'jwt',
  },
};
