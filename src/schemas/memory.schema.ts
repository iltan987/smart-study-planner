import { z } from 'zod';

export const memorySchema = z.object({
  memories: z.array(z.string()).nonempty('Memory cannot be empty.'),
});

export type MemorySchema = z.infer<typeof memorySchema>;
