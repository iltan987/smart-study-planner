import { Gender } from '@prisma/client';
import { z } from 'zod';
import { yearMonthDate } from './time.schema';

export const educationInfoSchema = z
  .object({
    id: z.string().cuid().optional(),
    institution: z
      .string()
      .nonempty({ message: 'Institution name is required.' })
      .max(200, { message: 'Institution name is too long.' }),
    degree: z
      .string()
      .nonempty({ message: 'Degree is required.' })
      .max(100, { message: 'Degree name is too long.' }),
    fieldOfStudy: z
      .string()
      .nonempty({ message: 'Field of study is required.' })
      .max(100, { message: 'Field of study is too long.' }),
    startDate: z.date({
      required_error: 'Start date is required.',
      invalid_type_error: 'Start date must be a valid date.',
    }),
    endDate: z.date().optional(),
    cgpa: z
      .number()
      .gte(0, { message: 'CGPA must be 0 or greater.' })
      .nullable()
      .optional(),
    gradingSystem: z
      .string()
      .max(50, { message: 'Grading system description is too long.' })
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      // If endDate is provided, it must be after startDate
      if (data.endDate && data.startDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: 'End date must be after start date.',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      const cgpaProvided = data.cgpa !== null && data.cgpa !== undefined;
      const gradingSystemProvided =
        data.gradingSystem !== null &&
        data.gradingSystem !== undefined &&
        data.gradingSystem.trim() !== '';
      return cgpaProvided === gradingSystemProvided;
    },
    {
      message:
        'CGPA and Grading System must be provided together or not at all.',
      path: ['cgpa'],
    }
  );
export type EducationInfoInput = z.infer<typeof educationInfoSchema>;

export const userProfileSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .max(100, { message: 'Name must be less than 100 characters.' })
    .refine((val) => val.trim().length > 0, { message: 'Name is required.' }),
  birthDate: yearMonthDate.optional().refine(
    (val) => {
      if (!val) return true;
      const d = new Date(Date.UTC(val.year, val.monthIndex, val.date));
      return d <= new Date();
    },
    { message: 'Birth date cannot be in the future.' }
  ),
  gender: z.nativeEnum(Gender).nullable(),
  nationality: z.string().max(100, 'Nationality is too long.').nullable(),
  languages: z
    .array(z.string().max(50, 'Language name is too long.'))
    .max(10, 'You can add up to 10 languages.')
    .optional(),
  educationHistory: z.array(educationInfoSchema).default([]),
});
export type UserProfileInput = z.infer<typeof userProfileSchema>;

export const updateEducationInfoFormSchema = z
  .object({
    id: z.string().cuid().optional(),
    institution: z
      .string()
      .nonempty({ message: 'Institution name is required.' })
      .max(200, { message: 'Institution name is too long.' }),
    degree: z
      .string()
      .nonempty({ message: 'Degree is required.' })
      .max(100, { message: 'Degree name is too long.' }),
    fieldOfStudy: z
      .string()
      .nonempty({ message: 'Field of study is required.' })
      .max(100, { message: 'Field of study is too long.' }),
    startDate: z.string().date('Start date must be a valid date.'),
    endDate: z
      .string()
      .date('End date must be a valid date.')
      .or(z.literal('')),
    cgpa: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (val === undefined || val === null || val.trim() === '') {
            return true; // Allow empty, null, or undefined
          }
          const num = parseFloat(val);
          // Check if it's a number and gte 0
          return !isNaN(num) && num >= 0;
        },
        {
          message:
            'CGPA must be a positive number (e.g., 3.75 or 85.0), or empty.',
        }
      ),
    gradingSystem: z
      .string()
      .max(50, { message: 'Grading system description is too long.' })
      .optional(),
  })
  .refine(
    (data) => {
      // If endDate is provided, it must be after startDate
      if (data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end > start;
      }
      return true;
    },
    {
      message: 'End date must be after start date.',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      const cgpaProvided = data.cgpa !== undefined && data.cgpa.trim() !== '';
      const gradingSystemProvided =
        data.gradingSystem !== undefined && data.gradingSystem.trim() !== '';
      return cgpaProvided === gradingSystemProvided;
    },
    {
      message:
        'CGPA and Grading System must be provided together or not at all.',
      path: ['cgpa'],
    }
  );
export type UpdateEducationInfoFormInput = z.infer<
  typeof updateEducationInfoFormSchema
>;

export const updateUserProfileFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .max(100, { message: 'Name must be less than 100 characters.' })
    .refine((val) => val.trim().length > 0, { message: 'Name is required.' }),
  birthDate: z
    .string()
    .refine(
      (val) => {
        if (val === '') return true;
        const date = new Date(val);
        if (isNaN(date.getTime())) return false;
        // Prevent future dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date <= today;
      },
      { message: 'Birth date must not be in the future.' }
    )
    .or(z.literal('')),
  gender: z.nativeEnum(Gender).or(z.literal('')),
  nationality: z.string().max(100, 'Nationality is too long.'),
  languages: z
    .array(z.string().max(50, 'Language name is too long.'))
    .max(10, 'You can add up to 10 languages.'),
  educationHistory: z.array(updateEducationInfoFormSchema),
});
export type UpdateUserProfileFormInput = z.infer<
  typeof updateUserProfileFormSchema
>;
