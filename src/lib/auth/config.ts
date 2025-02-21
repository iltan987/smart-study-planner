import type { NextAuthConfig } from 'next-auth';
import { Credentials, Google, GitHub } from './providers';

export default {
  providers: [Credentials, Google, GitHub],
  debug: process.env.NODE_ENV === 'development',
} satisfies NextAuthConfig;
