'use server';

import type { Response } from '@/types/response.type';
import { type LoginSchema } from '@/schemas/auth/login.schema';
import { signIn } from '@/lib/auth';
import { RESPONSE_MESSAGES } from '@/constants/response-messages';
import { InvalidCredentialsError } from '@/errors/InvalidCredentialsError';

type LoginFunction = (
  credentials: LoginSchema
) => Promise<Response<LoginSchema>>;

export const login: LoginFunction = async (credentials) => {
  try {
    await signIn('credentials', {
      ...credentials,
      redirect: false,
    });
    return {
      success: true,
      message: RESPONSE_MESSAGES.LOGIN_SUCCESS,
    };
  } catch (error) {
    console.error(error);
    if (error instanceof InvalidCredentialsError) {
      return {
        success: false,
        error: error.errors || RESPONSE_MESSAGES.INVALID_CREDENTIALS,
      };
    }
    return {
      success: false,
      error: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
    };
  }
};
