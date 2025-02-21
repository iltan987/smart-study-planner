import NextAuth from 'next-auth';
import config from './config';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '../db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  ...config,
});
