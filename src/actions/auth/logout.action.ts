'use server';

import { AUTH_COOKIE_NAME, RESPONSE_MESSAGES } from '@/constants';
import type { Response } from '@/types/response';
import { cookies } from 'next/headers';

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
