import { InvalidCredentialsError } from '@/errors/InvalidCredentialsError';
import { loginSchema } from '@/schemas/auth/login.schema';
import { comparePassword } from '@/utils/crypto.util';
import { getUserByEmail } from '@/utils/user.util';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

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
  pages: {
    signIn: '/login',
  },
} satisfies NextAuthConfig;
