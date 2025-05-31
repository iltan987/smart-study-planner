import { z } from 'zod';

export const registerUserSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .refine((password) => /[A-Z]/.test(password), {
      message: 'Password must contain at least one uppercase letter',
    })
    .refine((password) => /[a-z]/.test(password), {
      message: 'Password must contain at least one lowercase letter',
    })
    .refine((password) => /[0-9]/.test(password), {
      message: 'Password must contain at least one number',
    })
    .refine(
      (password) => /[!@#$£%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]/.test(password),
      {
        message: 'Password must contain at least one special character',
      }
    ),
});

export type RegisterUserSchema = z.infer<typeof registerUserSchema>;

export const registerUserFormSchema = registerUserSchema
  .extend({
    confirmPassword: z
      .string()
      .min(1, { message: 'Confirm password is required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterUserFormSchema = z.infer<typeof registerUserFormSchema>;
