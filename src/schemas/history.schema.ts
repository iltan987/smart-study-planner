import { ContentType, Role } from '@prisma/client';
import { z } from 'zod';

const commonSchema = z.object({
  time: z.coerce.date(),
});

export const textContentSchema = z
  .object({
    type: z.literal(ContentType.TEXT),
    role: z.nativeEnum(Role),
    text: z.string(),
  })
  .merge(commonSchema);

export type TextContentSchema = z.infer<typeof textContentSchema>;

export const functionCallContentSchema = z
  .object({
    type: z.literal(ContentType.FUNCTION_CALL),
    name: z.string(),
    args: z.record(z.string(), z.any()).default({}),
  })
  .merge(commonSchema);

export type FunctionCallContentSchema = z.infer<
  typeof functionCallContentSchema
>;

export const functionResponseContentSchema = z
  .object({
    type: z.literal(ContentType.FUNCTION_RESPONSE),
    name: z.string(),
    response: z.record(z.string(), z.any()).default({}),
  })
  .merge(commonSchema);

export type FunctionResponseContentSchema = z.infer<
  typeof functionResponseContentSchema
>;

export const historySchema = z.discriminatedUnion('type', [
  textContentSchema,
  functionCallContentSchema,
  functionResponseContentSchema,
]);

export type HistorySchema = z.infer<typeof historySchema>;
