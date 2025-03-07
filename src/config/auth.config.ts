import { InvalidCredentialsError } from '@/errors/InvalidCredentialsError';
import { loginSchema } from '@/schemas/auth/login.schema';
import { comparePassword } from '@/utils/crypto.util';
import { getUserByEmail } from '@/utils/user.util';
import type { DefaultSession, NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

import 'next-auth/jwt';

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = await loginSchema.safeParseAsync(credentials);

        if (!parsedCredentials.success) {
          throw new InvalidCredentialsError({
            errors: parsedCredentials.error.flatten(),
          });
        }

        const { email, password } = parsedCredentials.data;

        const user = await getUserByEmail(email);

        if (
          !user ||
          !user.password ||
          !(await comparePassword(password, user.password))
        ) {
          throw new InvalidCredentialsError();
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user.id = token.id;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
} satisfies NextAuthConfig;
