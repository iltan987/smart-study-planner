'use server';

import { hashPassword } from '@/utils/crypto.util';
import { RESPONSE_MESSAGES } from '@/constants/response-messages';
import type { Response } from '@/types/response';
import {
  registerSchema,
  type RegisterSchema,
} from '@/schemas/auth/register.schema';
import { getUserByEmail, createUser } from '@/utils/user.util';

type RegisterFunction = (
  credentials: RegisterSchema
) => Promise<Response<RegisterSchema>>;

export const register: RegisterFunction = async (credentials) => {
  try {
    const parsedCredentials = await registerSchema.safeParseAsync(credentials);

    if (!parsedCredentials.success) {
      return {
        success: false,
        error: parsedCredentials.error.flatten(),
      };
    }

    const { email, name, password } = parsedCredentials.data;

    const existingUser = await getUserByEmail(email, {
      select: { id: true },
    });

    if (existingUser) {
      return {
        success: false,
        error: RESPONSE_MESSAGES.USER_EXISTS,
      };
    }

    const hashedPassword = await hashPassword(password);

    await createUser({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
      },
    });

    return {
      success: true,
      message: RESPONSE_MESSAGES.REGISTER_SUCCESS,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
    };
  }
};
