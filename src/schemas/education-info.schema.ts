import { z } from 'zod';

export const educationInfoSchema = z.object({
  id: z.string(),
  school: z.string(),
  degree: z.string(),
  field: z.string(),
  start: z.coerce.date(),
  gpa: z.number().min(0).max(4.0),
});

export const updateEducationInfoSchema = z.object({
  id: z.string().cuid(),
  school: z.string().trim().nonempty().optional(),
  degree: z.string().trim().nonempty().optional(),
  field: z.string().trim().nonempty().optional(),
  start: z.coerce.date().optional(),
  gpa: z.number().min(0).max(4.0).optional(),
});

export type EducationInfoSchema = z.infer<typeof educationInfoSchema>;

export type UpdateEducationInfoSchema = z.infer<
  typeof updateEducationInfoSchema
>;
