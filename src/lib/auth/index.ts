import NextAuth from 'next-auth';
import { Credentials, Google, GitHub } from './providers';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Credentials, Google, GitHub],
});
