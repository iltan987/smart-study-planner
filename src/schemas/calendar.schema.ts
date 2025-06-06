import { z } from 'zod';

export const addCalendarEventFormSchema = z
  .object({
    title: z.string().refine((val) => val.trim().length > 0, {
      message: 'Title is required.',
    }),
    eventDate: z.string(),
    startTimeLocal: z.string(),
    endTimeLocal: z.string(),
  })
  .refine(
    (data) => {
      const start = data.startTimeLocal;
      const end = data.endTimeLocal;
      const startTimeParts = start.split(':');
      const startMinutes =
        parseInt(startTimeParts[0]) * 60 + parseInt(startTimeParts[1]);
      const endTimeParts = end.split(':');
      const endMinutes =
        parseInt(endTimeParts[0]) * 60 + parseInt(endTimeParts[1]);
      return endMinutes > startMinutes;
    },
    {
      message: 'End time must be after start time on the same day.',
      path: ['endTimeLocal'],
    }
  );

export type AddCalendarEventFormSchema = z.infer<
  typeof addCalendarEventFormSchema
>;

export const createCalendarEventInputSchema = z
  .object({
    title: z
      .string()
      .nonempty({ message: 'Title is required.' })
      .max(255, { message: 'Title must be 255 characters or less.' })
      .refine((val) => val.trim().length > 0, {
        message: 'Title is required.',
      }),
    start: z.date(),
    end: z.date(),
  })
  .refine(
    (data) => {
      const start = data.start;
      const end = data.end;
      const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
      return end.getTime() - start.getTime() <= oneDayInMilliseconds;
    },
    {
      message:
        'The difference between start and end must be no more than 24 hours.',
    }
  )
  .refine(
    (data) => {
      const start = data.start;
      const end = data.end;
      return end > start;
    },
    {
      message: 'End time must be after start time on the same day.',
      path: ['end'],
    }
  );
export type CreateCalendarEventInputSchema = z.infer<
  typeof createCalendarEventInputSchema
>;

export const updateCalendarEventInputSchema = z
  .object({
    eventId: z.string().cuid({
      message: 'Event ID must be a valid CUID.',
    }),
    title: z
      .string()
      .nonempty({ message: 'Title is required.' })
      .max(255, { message: 'Title must be 255 characters or less.' })
      .refine((val) => val.trim().length > 0, {
        message: 'Title is required.',
      }),
    start: z.date(),
    end: z.date(),
  })
  .refine(
    (data) =>
      data.start.getFullYear() === data.end.getFullYear() &&
      data.start.getMonth() === data.end.getMonth() &&
      data.start.getDate() === data.end.getDate(),
    {
      message: 'Start and end times must be on the same day.',
      path: ['end'],
    }
  )
  .refine(
    (data) => {
      const start = data.start;
      const end = data.end;
      return end > start;
    },
    {
      message: 'End time must be after start time on the same day.',
      path: ['end'],
    }
  );
export type UpdateCalendarEventInputSchema = z.infer<
  typeof updateCalendarEventInputSchema
>;

export const getCalendarEventsInputSchema = z
  .object({
    start: z.date(),
    end: z.date(),
    query: z.string().optional(),
    limit: z.number().int().positive().max(100).optional(),
  })
  .refine(
    (data) => {
      const start = data.start;
      const end = data.end;
      const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
      return end.getTime() - start.getTime() <= oneWeekInMilliseconds;
    },
    {
      message:
        'The difference between start and end must be no more than 1 week.',
      path: ['end'],
    }
  );
export type GetCalendarEventsInputSchema = z.infer<
  typeof getCalendarEventsInputSchema
>;

export const deleteCalendarEventInputSchema = z.object({
  eventId: z.string().cuid({
    message: 'Event ID must be a valid CUID.',
  }),
});
export type DeleteCalendarEventInputSchema = z.infer<
  typeof deleteCalendarEventInputSchema
>;
