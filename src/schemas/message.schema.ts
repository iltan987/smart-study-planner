import { z } from 'zod';

export const messageSchema = z
  .object({
    message: z.string().trim().nonempty({ message: 'Message is required' }),
    timestamp: z.coerce
      .number()
      .int()
      .positive({ message: 'Timestamp must be a positive integer' }),
    owner: z.enum(['user', 'ai']).default('user'),
  })
  .strict();

export type MessageSchema = z.infer<typeof messageSchema>;
