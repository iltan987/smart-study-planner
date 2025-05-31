'use server';

import { auth, signIn } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { RegisterUserSchema } from '@/schemas/register.schema';
import { registerUserSchema } from '@/schemas/register.schema';
import type { Result } from '@/types/response';
import { hashPassword } from '@/utils/crypto.util';

export async function register(
  input: RegisterUserSchema
): Promise<Result<undefined, RegisterUserSchema>> {
  try {
    const session = await auth();
    if (session) {
      return {
        success: false,
        error: 'You are already logged in',
      };
    }

    const validationResult = registerUserSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.flatten(),
      };
    }

    const { name, email, password } = validationResult.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'User with this email already exists',
      };
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
      },
    });

    await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during registration.',
    };
  }
}
