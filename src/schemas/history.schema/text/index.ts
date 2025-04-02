import { Role } from '@prisma/client';
import { z } from 'zod';
import { baseCreateTextContentSchema, baseTextContentSchema } from './base';

export const createUserTextContentSchema = baseCreateTextContentSchema.extend({
  role: z.literal(Role.USER).default(Role.USER),
  timeSent: z.coerce.date(),
});
export type CreateUserTextContentSchema = z.infer<
  typeof createUserTextContentSchema
>;

export const userTextContentSchema = baseTextContentSchema.extend({
  role: z.literal(Role.USER).default(Role.USER),
  time: z.coerce.date(),
  timeSent: z.coerce.date(),
});
export type UserTextContentSchema = z.infer<typeof userTextContentSchema>;

export const createModelTextContentSchema = baseCreateTextContentSchema.extend({
  role: z.literal(Role.MODEL).default(Role.MODEL),
});
export type CreateModelTextContentSchema = z.infer<
  typeof createModelTextContentSchema
>;

export const modelTextContentSchema = baseTextContentSchema.extend({
  role: z.literal(Role.MODEL).default(Role.MODEL),
  time: z.coerce.date(),
});
export type ModelTextContentSchema = z.infer<typeof modelTextContentSchema>;

export const textContentSchema = z.discriminatedUnion('role', [
  userTextContentSchema,
  modelTextContentSchema,
]);
export type TextContentSchema = z.infer<typeof textContentSchema>;

export const createTextContentSchema = z.discriminatedUnion('role', [
  createUserTextContentSchema,
  createModelTextContentSchema,
]);
export type CreateTextContentSchema = z.infer<typeof createTextContentSchema>;
