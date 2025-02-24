import type { NextAuthConfig } from 'next-auth';
import { Google, GitHub } from './providers';

export default {
  providers: [Google, GitHub],
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
} satisfies NextAuthConfig;
