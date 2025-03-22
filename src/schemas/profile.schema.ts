import { Gender, Language } from '@prisma/client';
import { z } from 'zod';
import { educationInfoSchema } from './education-info.schema';

export const profileSchema = z.object({
  gender: z.nativeEnum(Gender).nullable(),
  dob: z.coerce.date().nullable(),
  language: z.nativeEnum(Language),
  education: z.array(educationInfoSchema),
});

export const updateProfileSchema = z.object({
  gender: z.nativeEnum(Gender).nullable().optional(),
  dob: z.coerce.date().nullable().optional(),
  language: z.nativeEnum(Language).optional(),
  education: z.array(educationInfoSchema).optional(),
});

export type ProfileSchema = z.infer<typeof profileSchema>;

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
