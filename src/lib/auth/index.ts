import NextAuth from 'next-auth';
import config from './config';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '../db';
import { Credentials } from './providers';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Credentials, ...config.providers],
  session: {
    strategy: 'jwt',
  },
  trustHost: config.trustHost,
  pages: config.pages,
  debug: config.debug,
});
