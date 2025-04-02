import { ContentType } from '@/types/content-type.type';
import { Role } from '@prisma/client';
import { z } from 'zod';

export const createFunctionResponseContentSchema = z.object({
  role: z.literal(Role.FUNCTION).default(Role.FUNCTION).optional(),
  type: z
    .literal(ContentType.FUNCTION_RESPONSE)
    .default(ContentType.FUNCTION_RESPONSE)
    .optional(),
  name: z.string(),
  response: z.record(z.string(), z.any()).default({}),
});
export type CreateFunctionResponseContentSchema = z.infer<
  typeof createFunctionResponseContentSchema
>;

export const functionResponseContentSchema = z.object({
  role: z.literal(Role.FUNCTION).default(Role.FUNCTION),
  type: z
    .literal(ContentType.FUNCTION_RESPONSE)
    .default(ContentType.FUNCTION_RESPONSE),
  name: z.string(),
  response: z.record(z.string(), z.any()).default({}),
  time: z.coerce.date(),
});

export type FunctionResponseContentSchema = z.infer<
  typeof functionResponseContentSchema
>;
