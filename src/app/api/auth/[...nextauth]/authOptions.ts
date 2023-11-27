import { prisma } from '@/db';
import { ROUTE_PATHS } from '@/routes';
import { compare } from 'bcrypt';
import { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: ROUTE_PATHS.PUBLIC.LOGIN,
    signOut: ROUTE_PATHS.PUBLIC.LOGOUT,
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email' },
        password: { label: 'Password' },
      },
      authorize: async (credentials) => {
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }
        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user) {
            return null;
          }

          if (user && (await compare(credentials.password, user.password))) {
            return user;
          }

          return null;
        } catch (error) {
          console.warn(error);
          return null;
        }
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
