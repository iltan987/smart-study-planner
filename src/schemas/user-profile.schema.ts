import { z } from 'zod';
import { profileSchema, updateProfileSchema } from './profile.schema';

export const userProfileSchema = z.object({
  name: z.string(),
  email: z.string(),
  image: z.string().nullable(),
  profile: profileSchema,

  createdAt: z.coerce.date().readonly(),
  updatedAt: z.coerce.date().readonly(),
});

export const updateUserProfileSchema = z
  .object({
    name: z.string().trim().nonempty().optional(),
    email: z.string().trim().nonempty().email().toLowerCase().optional(),
    currentPassword: z.string().optional(),
    password: z
      .string()
      .min(8)
      .regex(/[a-z]/)
      .regex(/[A-Z]/)
      .regex(/[0-9]/)
      .optional(),
    confirmPassword: z.string().optional(),
    image: z.string().url().nullable().optional(),
    profile: updateProfileSchema.optional(),
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => !data.password || data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => !data.password || data.currentPassword, {
    message: 'Current password is required',
    path: ['currentPassword'],
  });

export type UserProfileSchema = z.infer<typeof userProfileSchema>;

export type UpdateUserProfileSchema = z.infer<typeof updateUserProfileSchema>;
