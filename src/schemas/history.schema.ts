import { ContentType, Role } from '@prisma/client';
import { z } from 'zod';

// Some parts commented out for now, but can be used later if needed

export const textContentSchema = z.object({
  type: z.literal(ContentType.TEXT),
  textContent: z.object({
    text: z.string(),
  }),
});

export type TextContentSchema = z.infer<typeof textContentSchema>;

export const functionCallContentSchema = z.object({
  type: z.literal(ContentType.FUNCTION_CALL),
  functionCallContent: z.object({
    name: z.string(),
    args: z.record(z.string(), z.any()).default({}),
  }),
});

export type FunctionCallContentSchema = z.infer<
  typeof functionCallContentSchema
>;

export const functionResponseContentSchema = z.object({
  type: z.literal(ContentType.FUNCTION_RESPONSE),
  functionResponseContent: z.object({
    name: z.string(),
    response: z.record(z.string(), z.any()).default({}),
  }),
});

export type FunctionResponseContentSchema = z.infer<
  typeof functionResponseContentSchema
>;

export const historySchema = z.object({
  role: z.nativeEnum(Role),
  time: z.coerce.date(),
  content: z.discriminatedUnion('type', [
    textContentSchema,
    functionCallContentSchema,
    functionResponseContentSchema,
  ]),
  // createdAt: z.coerce.date(),
  // updatedAt: z.coerce.date(),
});

export type HistorySchema = z.infer<typeof historySchema>;

// export const createHistorySchema = z.object({
//   role: z.nativeEnum(Role),
//   time: z.coerce.date(),
//   content: z.discriminatedUnion('type', [
//     textContentSchema,
//     functionCallContentSchema,
//     functionResponseContentSchema,
//   ]),
// });

// export type CreateHistorySchema = z.infer<typeof createHistorySchema>;

export const textContentOnlyHistorySchema = z.object({
  role: z.nativeEnum(Role),
  time: z.coerce.date(),
  content: textContentSchema,
  // createdAt: z.coerce.date(),
  // updatedAt: z.coerce.date(),
});

export type TextContentOnlyHistorySchema = z.infer<
  typeof textContentOnlyHistorySchema
>;

// export const textContentOnlyCreateHistorySchema = z.object({
//   role: z.nativeEnum(Role),
//   time: z.coerce.date(),
//   content: textContentSchema,
// });

// export type TextContentOnlyCreateHistorySchema = z.infer<
//   typeof textContentOnlyCreateHistorySchema
// >;

export const functionCallContentOnlyHistorySchema = z.object({
  role: z.nativeEnum(Role),
  time: z.coerce.date(),
  content: functionCallContentSchema,
  // createdAt: z.coerce.date(),
  // updatedAt: z.coerce.date(),
});

export type FunctionCallContentOnlyHistorySchema = z.infer<
  typeof functionCallContentOnlyHistorySchema
>;

// export const functionCallContentOnlyCreateHistorySchema = z.object({
//   role: z.nativeEnum(Role),
//   time: z.coerce.date(),
//   content: functionCallContentSchema,
// });

// export type FunctionCallContentOnlyCreateHistorySchema = z.infer<
//   typeof functionCallContentOnlyCreateHistorySchema
// >;

export const functionResponseContentOnlyHistorySchema = z.object({
  role: z.nativeEnum(Role),
  time: z.coerce.date(),
  content: functionResponseContentSchema,
  // createdAt: z.coerce.date(),
  // updatedAt: z.coerce.date(),
});

export type FunctionResponseContentOnlyHistorySchema = z.infer<
  typeof functionResponseContentOnlyHistorySchema
>;

// export const functionResponseContentOnlyCreateHistorySchema = z.object({
//   role: z.nativeEnum(Role),
//   time: z.coerce.date(),
//   content: functionResponseContentSchema,
// });

// export type FunctionResponseContentOnlyCreateHistorySchema = z.infer<
//   typeof functionResponseContentOnlyCreateHistorySchema
// >;
