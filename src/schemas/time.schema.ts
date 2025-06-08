import { z } from 'zod';

// Schema for a date with year and month all required
export const yearMonth = z.object({
  year: z.number().int().min(0, 'Year must be a positive integer'),
  monthIndex: z
    .number()
    .int()
    .min(0, 'Month index must be a non-negative integer')
    .max(11, 'Month index must be less than 12'),
});
export type YearMonth = z.infer<typeof yearMonth>;

// Schema for a date with year, month, and date all required
export const yearMonthDate = yearMonth.extend({
  date: z
    .number()
    .int()
    .min(1, 'Date must be a positive integer')
    .max(31, 'Date must be less than or equal to 31'),
});
export type YearMonthDate = z.infer<typeof yearMonthDate>;

// Schema for a time with hours, minutes, seconds, and milliseconds. Seconds and milliseconds are optional.
export const hoursMinutesSecondsMs = z.object({
  hours: z
    .number()
    .int()
    .positive('Hours must be a non-negative integer')
    .max(23, 'Hours must be less than 24'),
  minutes: z
    .number()
    .int()
    .positive('Minutes must be a non-negative integer')
    .max(59, 'Minutes must be less than 60'),
  seconds: z
    .number()
    .int()
    .positive('Seconds must be a non-negative integer')
    .max(59, 'Seconds must be less than 60')
    .optional(),
  ms: z
    .number()
    .int()
    .positive('Milliseconds must be a non-negative integer')
    .max(999, 'Milliseconds must be less than 1000')
    .optional(),
});
export type HoursMinutesSecondsMs = z.infer<typeof hoursMinutesSecondsMs>;
