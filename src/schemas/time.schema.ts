import { z } from 'zod';

// Schema for a date with year and month all required
const yearMonth = z.object({
  year: z.number().int().min(0, 'Year must be a positive integer'),
  monthIndex: z
    .number()
    .int()
    .min(0, 'Month index must be a non-negative integer')
    .max(11, 'Month index must be less than 12'),
});

// Schema for a date with year, month, and date all required
export const yearMonthDate = yearMonth.extend({
  date: z
    .number()
    .int()
    .min(1, 'Date must be a positive integer')
    .max(31, 'Date must be less than or equal to 31'),
});
export type YearMonthDate = z.infer<typeof yearMonthDate>;
