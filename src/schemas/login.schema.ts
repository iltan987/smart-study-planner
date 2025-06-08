import { z } from 'zod';

export const loginUserSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export type LoginUserInput = z.infer<typeof loginUserSchema>;
