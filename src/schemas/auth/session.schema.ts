import { z } from 'zod';

export const sessionSchema = z.object({
  id: z.string(),
});

export type SessionSchema = z.infer<typeof sessionSchema>;
