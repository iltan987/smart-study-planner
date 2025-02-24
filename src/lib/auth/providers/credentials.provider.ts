import Credentials from 'next-auth/providers/credentials';
import { loginSchema } from '@/schemas/auth/login.schema';
import { InvalidLoginError } from '@/errors/InvalidLoginError';
import { InvalidCredentialsError } from '@/errors/InvalidCredentialsError';
import { getUserByEmail } from '@/utils/user.util';
import { comparePassword } from '@/utils/password.util';

const credentialsProvider = Credentials({
  async authorize(credentials) {
    const parsedCredentials = await loginSchema.safeParseAsync(credentials);

    if (!parsedCredentials.success) {
      throw new InvalidLoginError(parsedCredentials.error.flatten());
    }

    const { email, password } = parsedCredentials.data;

    const user = await getUserByEmail(email);

    if (!user || !user.password) {
      throw new InvalidCredentialsError();
    }

    const passwordsMatch = await comparePassword(password, user.password);

    if (!passwordsMatch) {
      throw new InvalidCredentialsError();
    }

    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  },
});

export { credentialsProvider as Credentials };
