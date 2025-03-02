import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { AUTH_COOKIE_NAME } from '@/utils/cookie.util';

const AUTH_ROUTES = ['/login', '/register'];
const DEFAULT_REDIRECT = '/';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const auth_token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  let isAuthenticated = false;

  // Verify token if exists
  if (auth_token) {
    try {
      await verifyToken(auth_token);
      isAuthenticated = true;
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }

  // Handle logout route
  if (path === '/logout') {
    const response = isAuthenticated
      ? NextResponse.redirect(new URL('/login', request.url))
      : NextResponse.redirect(new URL('/', request.url));

    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  // Redirect authenticated users from auth routes
  if (AUTH_ROUTES.includes(path)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(DEFAULT_REDIRECT, request.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    const response = NextResponse.redirect(loginUrl);

    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
