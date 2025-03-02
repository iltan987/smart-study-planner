'use server';

import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, RESPONSE_MESSAGES } from '@/constants';
import { verifyToken } from '@/lib/jwt';
import {
  type SessionSchema,
  sessionSchema,
} from '@/schemas/auth/session.schema';
import type { Response } from '@/types/response';

type getSessionFunction = () => Promise<Response<SessionSchema, SessionSchema>>;

export const getSession: getSessionFunction = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return {
        success: false,
        error: RESPONSE_MESSAGES.UNAUTHORIZED,
      };
    }

    const payload = await verifyToken(token).catch(async () => {
      cookieStore.delete(AUTH_COOKIE_NAME);
      return null;
    });
    if (!payload) {
      return {
        success: false,
        error: RESPONSE_MESSAGES.UNAUTHORIZED,
      };
    }

    const session = await sessionSchema.safeParseAsync(payload.payload);

    if (!session.success) {
      cookieStore.delete(AUTH_COOKIE_NAME);
      return {
        success: false,
        error: RESPONSE_MESSAGES.UNAUTHORIZED,
      };
    }

    return {
      success: true,
      message: RESPONSE_MESSAGES.SESSION_SUCCESS,
      data: session.data,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
    };
  }
};
