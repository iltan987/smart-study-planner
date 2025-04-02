import { ContentType } from '@/types/content-type.type';
import { Role } from '@prisma/client';
import { z } from 'zod';

export const baseCreateTextContentSchema = z.object({
  role: z.enum([Role.USER, Role.MODEL]),
  type: z.literal(ContentType.TEXT).default(ContentType.TEXT).optional(),
  text: z.string().nonempty(),
});

export const baseTextContentSchema = z.object({
  role: z.enum([Role.USER, Role.MODEL]),
  type: z.literal(ContentType.TEXT).default(ContentType.TEXT),
  text: z.string().nonempty(),
});
export type BaseTextContentSchema = z.infer<typeof baseTextContentSchema>;
