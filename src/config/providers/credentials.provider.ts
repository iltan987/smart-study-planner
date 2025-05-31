import { prisma } from '@/lib/prisma';
import { loginUserSchema } from '@/schemas/login.schema';
import { comparePassword } from '@/utils/crypto.util';
import CredentialsProvider from 'next-auth/providers/credentials';

const provider = CredentialsProvider({
  name: 'Credentials',
  credentials: {
    email: {
      label: 'Email',
      type: 'email',
      placeholder: 'john.doe@example.com',
    },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    if (!credentials) {
      return null;
    }

    try {
      const { email, password } = await loginUserSchema.parseAsync(credentials);

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
        },
      });

      if (!user || !user.password) {
        return null;
      }

      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      console.error('Authorize error:', error);
      return null;
    }
  },
});

export default provider;
