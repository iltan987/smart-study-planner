import { ContentType } from '@/types/content-type.type';
import { Role } from '@prisma/client';
import { z } from 'zod';

export const createFunctionCallContentSchema = z.object({
  role: z.literal(Role.MODEL).default(Role.MODEL).optional(),
  type: z
    .literal(ContentType.FUNCTION_CALL)
    .default(ContentType.FUNCTION_CALL)
    .optional(),
  name: z.string(),
  args: z.record(z.string(), z.any()).default({}),
});
export type CreateFunctionCallContentSchema = z.infer<
  typeof createFunctionCallContentSchema
>;

export const functionCallContentSchema = z.object({
  role: z.literal(Role.MODEL).default(Role.MODEL),
  type: z.literal(ContentType.FUNCTION_CALL).default(ContentType.FUNCTION_CALL),
  name: z.string(),
  args: z.record(z.string(), z.any()).default({}),
  time: z.coerce.date(),
});

export type FunctionCallContentSchema = z.infer<
  typeof functionCallContentSchema
>;
