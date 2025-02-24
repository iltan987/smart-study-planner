'use server';

import { type LoginSchema } from '@/schemas/auth/login.schema';
import type { Response } from '@/types/response';
import { signIn } from '@/lib/auth';
import { InvalidCredentialsError } from '@/errors/InvalidCredentialsError';
import { InvalidLoginError } from '@/errors/InvalidLoginError';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { getURLFromRedirectError } from 'next/dist/client/components/redirect';

type LoginFunction = (
  credentials: LoginSchema,
  callbackUrl: string
) => Promise<Response<LoginSchema>>;

export const login: LoginFunction = async (credentials, callbackUrl) => {
  try {
    await signIn('credentials', {
      ...credentials,
      redirectTo: callbackUrl,
    });

    return {
      success: true,
      message: 'Logged in successfully',
    };
  } catch (error) {
    if (error instanceof InvalidLoginError) {
      return {
        success: false,
        error: error.error,
      };
    }

    if (error instanceof InvalidCredentialsError) {
      return {
        success: false,
        error: error.code,
      };
    }

    if (isRedirectError(error)) {
      const url = getURLFromRedirectError(error);
      console.log('Redirecting to', url);
      throw error;
    }

    return {
      success: false,
      error: 'Something went wrong',
    };
  }
};
