'use server';

import { type LoginSchema } from '@/schemas/auth/login.schema';
import type { Response } from '@/types/response';

type LoginFunction = (
  credentials: LoginSchema
) => Promise<Response<LoginSchema>>;

export const login: LoginFunction = async (_credentials) => {
  // TODO: Implement login
  throw new Error('Not implemented');
};
