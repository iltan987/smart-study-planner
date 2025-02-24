import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
      message: 'Email is required',
    })
    .trim()
    .toLowerCase()
    .nonempty({ message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  password: z.string({
    required_error: 'Password is required',
    invalid_type_error: 'Password must be a string',
    message: 'Password is required',
  }),
});

export type LoginSchema = z.infer<typeof loginSchema>;
