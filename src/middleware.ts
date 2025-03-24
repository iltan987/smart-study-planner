import authConfig from '@/config/auth.config';
import { RESPONSE_MESSAGES_ERRORS } from '@/constants/response-messages';
import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

const AUTH_ROUTES = ['/login', '/register'];
const DEFAULT_REDIRECT = '/';
const API_ROUTE = '/api/auth';
const ALLOWED_API_ROUTES = [
  '/api/auth/session',
  '/api/auth/csrf',
  '/api/auth/providers',
];
const API_ROUTES_NEED_AUTH = ['/api/auth/signout'];
const API_ROUTES_NO_AUTH = ['/api/auth/callback/credentials'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (pathname.startsWith(API_ROUTE)) {
    if (ALLOWED_API_ROUTES.some((route) => pathname.startsWith(route))) {
      return NextResponse.next();
    } else if (
      isLoggedIn &&
      API_ROUTES_NEED_AUTH.some((route) => pathname.startsWith(route))
    ) {
      return NextResponse.next();
    } else if (
      !isLoggedIn &&
      API_ROUTES_NO_AUTH.some((route) => pathname.startsWith(route))
    ) {
      return NextResponse.next();
    } else {
      console.log(`API route: ${pathname}`);
      const response = NextResponse.json(
        { error: RESPONSE_MESSAGES_ERRORS.UNAUTHORIZED },
        { status: 401 }
      );
      return response;
    }
  }

  if (pathname === '/logout') {
    if (isLoggedIn) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect authenticated users from auth routes
  if (AUTH_ROUTES.includes(pathname)) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_REDIRECT, req.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
