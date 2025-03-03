'use server';

import { AUTH_COOKIE_NAME, RESPONSE_MESSAGES } from '@/constants';
import type { Response } from '@/types/response';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

type LogoutFunction = (returnOrRedirect?: boolean) => Promise<Response<void>>;

export const logout: LogoutFunction = async (returnOrRedirect = false) => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    if (returnOrRedirect) {
      return {
        success: true,
        message: RESPONSE_MESSAGES.LOGOUT_SUCCESS,
      };
    }
    redirect('/login');
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
    };
  }
};
