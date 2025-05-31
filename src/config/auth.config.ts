import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';
import { credentialsProvider } from './providers';

const config = {
  providers: [credentialsProvider],
  callbacks: {
    async jwt(params) {
      const { user, token, trigger, session } = params;
      if (user)
        Object.assign(token, {
          id: user.id,
          email: user.email,
          name: user.name,
        });
      if (trigger === 'update' && session) Object.assign(token, session);
      return token;
    },
    async session(params) {
      if (params.token && params.session.user) {
        params.session.user.id = params.token.id;
        params.session.user.email = params.token.email;
        params.session.user.name = params.token.name;
      }
      return params.session;
    },
    async authorized(params) {
      const { nextUrl } = params.request;
      const isAuthenticated = !!params.auth;
      const path = nextUrl.pathname;

      const publicAuthRoutes = ['/login', '/register'];
      const protectedRoutes = [
        '/',
        '/calendar',
        '/chatbot',
        '/profile',
        '/settings',
        '/todos',
      ];

      const isPublicAuthRoute = publicAuthRoutes.some((route) =>
        path.startsWith(route)
      );
      const isProtectedRoute = protectedRoutes.some(
        (route) => path === route || path.startsWith(route + '/')
      );

      if (isPublicAuthRoute) {
        if (isAuthenticated) {
          return NextResponse.redirect(new URL('/', nextUrl.origin));
        }
        return true;
      }

      if (isProtectedRoute) {
        return isAuthenticated;
      }

      return true;
    },
  },
  pages: {
    signIn: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
} satisfies NextAuthConfig;

export default config;
