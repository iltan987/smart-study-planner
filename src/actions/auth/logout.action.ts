'use server';

import { AUTH_COOKIE_NAME } from '@/utils/cookie.util';
import type { Response } from '@/types/response';
import { cookies } from 'next/headers';
import { RESPONSE_MESSAGES } from '@/utils/response_messages';

type LogoutFunction = () => Promise<Response<void>>;

export const logout: LogoutFunction = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    return {
      success: true,
      message: RESPONSE_MESSAGES.LOGOUT_SUCCESS,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
    };
  }
};
