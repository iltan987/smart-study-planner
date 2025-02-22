'use server';

import db from '@/lib/db';
import {
  registerSchema,
  type RegisterSchema,
} from '@/schemas/auth/register.schema';
import type { Response } from '@/types/response';
import { hashPassword } from '@/utils/password.util';

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

    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'User already exists',
      };
    }

    const hashedPassword = await hashPassword(password);

    await db.user.create({
      data: { email, name, password: hashedPassword },
    });

    return {
      success: true,
      message: 'User registered successfully',
    };
  } catch {
    return {
      success: false,
      error: 'An error occurred while registering',
    };
  }
};
