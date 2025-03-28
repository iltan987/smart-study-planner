import { z } from 'zod';

export const memorySchema = z.object({
  id: z.string().cuid(),
  content: z.string().nonempty(),
  createdAt: z.date(),
});

export type MemorySchema = z.infer<typeof memorySchema>;

export const updateMemorySchema = z.object({
  content: z.string().nonempty(),
});

export type UpdateMemorySchema = z.infer<typeof updateMemorySchema>;
