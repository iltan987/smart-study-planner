import { ContentType, TextContentRole } from '@/generated/prisma-client';
import { z } from 'zod';

// --- Schemas for Input/Creation (potentially without 'time') ---

const baseTextSchema = z.object({
  text: z.string(),
  timeSent: z.coerce.date(),
});

export const userTextSchema = baseTextSchema.extend({
  type: z.literal(ContentType.text),
  role: z.literal(TextContentRole.user),
});

export type UserTextSchema = z.infer<typeof userTextSchema>;

export const modelTextSchema = baseTextSchema.extend({
  type: z.literal(ContentType.text),
  role: z.literal(TextContentRole.model),
});

export type ModelTextSchema = z.infer<typeof modelTextSchema>;

const _textContentSchemaForType = z.union([userTextSchema, modelTextSchema]);

const textContentSchemas: Record<
  TextContentRole,
  typeof userTextSchema | typeof modelTextSchema
> = {
  [TextContentRole.user]: userTextSchema,
  [TextContentRole.model]: modelTextSchema,
};

export const textContentSchema = z
  .any()
  .transform((data) => data as TextContentSchema)
  .superRefine((data, ctx) => {
    const role = z.nativeEnum(TextContentRole).safeParse(data.role);
    if (!role.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid role: ${data.role}`,
      });
      return;
    }
    const roleValue = role.data;

    const schema = textContentSchemas[roleValue];
    const result = schema.safeParse(data);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        ctx.addIssue(issue);
      });
    }
  });

export type TextContentSchema = z.infer<typeof _textContentSchemaForType>;

export const functionCallContentSchema = z.object({
  type: z.literal(ContentType.function_call),
  name: z.string(),
  args: z.record(z.string(), z.any()).default({}),
});

export type FunctionCallContentSchema = z.infer<
  typeof functionCallContentSchema
>;

export const functionResponseContentSchema = z.object({
  type: z.literal(ContentType.function_response),
  name: z.string(),
  response: z.record(z.string(), z.any()).default({}),
});

export type FunctionResponseContentSchema = z.infer<
  typeof functionResponseContentSchema
>;

const _historySchemaForType = z.union([
  textContentSchema,
  functionCallContentSchema,
  functionResponseContentSchema,
]);

const historySchemas: Record<
  ContentType,
  | typeof textContentSchema
  | typeof functionCallContentSchema
  | typeof functionResponseContentSchema
> = {
  [ContentType.text]: textContentSchema,
  [ContentType.function_call]: functionCallContentSchema,
  [ContentType.function_response]: functionResponseContentSchema,
};

export const historySchema = z
  .any()
  .transform((data) => data as HistorySchema)
  .superRefine((data, ctx) => {
    const type = z.nativeEnum(ContentType).safeParse(data.type);
    if (!type.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid type: ${data.type}`,
      });
      return;
    }

    const schema = historySchemas[type.data];
    const result = schema.safeParse(data);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        ctx.addIssue(issue);
      });
    }
  });

export type HistorySchema = z.infer<typeof _historySchemaForType>;

/* SCHEMAS THAT ARE COMING AS A RESULT OF FUNCTIONS (OR DATABASE) */

const baseGetSchema = z.object({
  time: z.coerce.date(),
});

const baseTextGetSchema = baseGetSchema.extend({
  text: z.string(),
  timeSent: z.coerce.date(),
});

export const userTextGetSchema = baseTextGetSchema.extend({
  type: z.literal(ContentType.text),
  role: z.literal(TextContentRole.user),
});

export type UserTextGetSchema = z.infer<typeof userTextGetSchema>;

export const modelTextGetSchema = baseTextGetSchema.extend({
  type: z.literal(ContentType.text),
  role: z.literal(TextContentRole.model),
});

export type ModelTextGetSchema = z.infer<typeof modelTextGetSchema>;

const _textContentGetSchemaForType = z.union([
  userTextGetSchema,
  modelTextGetSchema,
]);

const textContentGetSchemas: Record<
  TextContentRole,
  typeof userTextGetSchema | typeof modelTextGetSchema
> = {
  [TextContentRole.user]: userTextGetSchema,
  [TextContentRole.model]: modelTextGetSchema,
};

export const textContentGetSchema = z
  .any()
  .transform((data) => data as TextContentGetSchema)
  .superRefine((data, ctx) => {
    const role = z.nativeEnum(TextContentRole).safeParse(data.role);
    if (!role.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid role: ${data.role}`,
      });
      return;
    }
    const roleValue = role.data;

    const schema = textContentGetSchemas[roleValue];
    const result = schema.safeParse(data);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        ctx.addIssue(issue);
      });
    }
  });

export type TextContentGetSchema = z.infer<typeof _textContentGetSchemaForType>;

export const functionCallContentGetSchema = baseGetSchema.extend({
  type: z.literal(ContentType.function_call),
  name: z.string(),
  args: z.record(z.string(), z.any()).default({}),
});

export type FunctionCallContentGetSchema = z.infer<
  typeof functionCallContentGetSchema
>;

export const functionResponseContentGetSchema = baseGetSchema.extend({
  type: z.literal(ContentType.function_response),
  name: z.string(),
  response: z.record(z.string(), z.any()).default({}),
});

export type FunctionResponseContentGetSchema = z.infer<
  typeof functionResponseContentGetSchema
>;

const _historyGetSchemaForType = z.union([
  textContentGetSchema,
  functionCallContentGetSchema,
  functionResponseContentGetSchema,
]);

const historyGetSchemas: Record<
  ContentType,
  | typeof textContentGetSchema
  | typeof functionCallContentGetSchema
  | typeof functionResponseContentGetSchema
> = {
  [ContentType.text]: textContentGetSchema,
  [ContentType.function_call]: functionCallContentGetSchema,
  [ContentType.function_response]: functionResponseContentGetSchema,
};

export const historyGetSchema = z
  .any()
  .transform((data) => data as HistoryGetSchema)
  .superRefine((data, ctx) => {
    const type = z.nativeEnum(ContentType).safeParse(data.type);
    if (!type.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid type: ${data.type}`,
      });
      return;
    }

    const schema = historyGetSchemas[type.data];
    const result = schema.safeParse(data);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        ctx.addIssue(issue);
      });
    }
  });

export type HistoryGetSchema = z.infer<typeof _historyGetSchemaForType>;
