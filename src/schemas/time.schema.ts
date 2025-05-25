import { z } from 'zod';

export const yearMonthDateSchema = z
  .object({
    year: z.number().int().min(1970).max(2100),
    month: z.number().int().min(1).max(12),
    date: z.number().int().min(1).max(31),
  })
  .refine(
    (data) => {
      const { year, month, date } = data;
      const localDate = new Date(year, month - 1, date);
      return (
        localDate.getFullYear() === year &&
        localDate.getMonth() + 1 === month &&
        localDate.getDate() === date
      );
    },
    {
      message: 'Invalid date',
      path: ['date'],
    }
  );
export type YearMonthDate = z.infer<typeof yearMonthDateSchema>;

export const hoursMinutesSchema = z
  .object({
    hours: z.number().int().min(0).max(23),
    minutes: z.number().int().min(0).max(59),
  })
  .refine(
    (data) => {
      const { hours, minutes } = data;
      const date = new Date(0, 0, 0, hours, minutes);
      return date.getHours() === hours && date.getMinutes() === minutes;
    },
    {
      message: 'Invalid time',
      path: ['hours'],
    }
  );
export type HoursMinutes = z.infer<typeof hoursMinutesSchema>;
