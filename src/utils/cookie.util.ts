import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export const AUTH_COOKIE_NAME = 'auth_token';

export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day

export const AUTH_COOKIE_OPTIONS: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: AUTH_COOKIE_MAX_AGE,
};
