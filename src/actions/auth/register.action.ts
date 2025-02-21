'use server';

import { type RegisterSchema } from '@/schemas/auth/register.schema';
import type { Response } from '@/types/response';

type RegisterFunction = (
  credentials: RegisterSchema
) => Promise<Response<RegisterSchema>>;

export const register: RegisterFunction = async (_credentials) => {
  throw new Error('Not implemented yet');
};
