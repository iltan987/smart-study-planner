import { z } from 'zod';

export const memorySchema = z.object({
  content: z.string().nonempty(),
});

export type MemorySchema = z.infer<typeof memorySchema>;
