'use server';

import { comparePassword } from '@/utils/crypto.util';
import { generateToken } from '@/lib/jwt';
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  RESPONSE_MESSAGES,
} from '@/constants';
import type { Response } from '@/types/response';
import { loginSchema, type LoginSchema } from '@/schemas/auth/login.schema';
import { cookies } from 'next/headers';
import { sessionSchema } from '@/schemas/auth/session.schema';
import { getUserByEmail } from '@/utils/user.util';

type LoginFunction = (
  credentials: LoginSchema
) => Promise<Response<LoginSchema>>;

export const login: LoginFunction = async (credentials) => {
  try {
    const parsedCredentials = await loginSchema.safeParseAsync(credentials);

    if (!parsedCredentials.success) {
      return {
        success: false,
        error: parsedCredentials.error.flatten(),
      };
    }

    const { email, password } = parsedCredentials.data;

    const user = await getUserByEmail(email, {
      select: {
        id: true,
        password: true,
      },
    });

    if (!user || !(await comparePassword(password, user.password))) {
      return {
        success: false,
        error: RESPONSE_MESSAGES.INVALID_CREDENTIALS,
      };
    }

    const token = await generateToken(sessionSchema.parse(user));
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

    return {
      success: true,
      message: RESPONSE_MESSAGES.LOGIN_SUCCESS,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
    };
  }
};
