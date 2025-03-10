import { z } from 'zod';

export const messageSchema = z
  .object({
    content: z.string().trim().nonempty({ message: 'Message is required' }),
    time: z.date(),
    owner: z.enum(['user', 'model']).default('model'),
  })
  .strict();

export type MessageSchema = z.infer<typeof messageSchema>;
