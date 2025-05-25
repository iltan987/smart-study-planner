import { z } from 'zod';
import { hoursMinutesSchema, yearMonthDateSchema } from './time.schema';

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
      const startMinutes =
        parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
      const endMinutes =
        parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);
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
      .min(1, { message: 'Title is required.' })
      .max(255, { message: 'Title must be 255 characters or less.' }),
    eventDate: yearMonthDateSchema,
    startTimeLocal: hoursMinutesSchema,
    endTimeLocal: hoursMinutesSchema,
    clientTimezone: z.string({
      required_error: 'Client timezone is required.',
    }),
  })
  .refine(
    (data) => {
      const start = data.startTimeLocal;
      const end = data.endTimeLocal;
      const startMinutes = start.hours * 60 + start.minutes;
      const endMinutes = end.hours * 60 + end.minutes;
      return endMinutes > startMinutes;
    },
    {
      message: 'End time must be after start time on the same day.',
      path: ['endTimeLocal'],
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
      .min(1, { message: 'Title is required.' })
      .max(255, { message: 'Title must be 255 characters or less.' })
      .optional(), // Title is optional for updates
    eventDate: yearMonthDateSchema.optional(),
    startTimeLocal: hoursMinutesSchema.optional(),
    endTimeLocal: hoursMinutesSchema.optional(),
    clientTimezone: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = data.startTimeLocal;
      const end = data.endTimeLocal;
      if (start && end) {
        const startMinutes = start.hours * 60 + start.minutes;
        const endMinutes = end.hours * 60 + end.minutes;
        return endMinutes > startMinutes;
      }
      return true; // If one of them is not provided, we skip this check
    },
    {
      message: 'End time must be after start time on the same day.',
      path: ['endTimeLocal'],
    }
  )
  .refine(
    (data) => {
      const timeFieldsProvided =
        data.eventDate || data.startTimeLocal || data.endTimeLocal;
      if (timeFieldsProvided && !data.clientTimezone) {
        return false; // clientTimezone is required if any time fields are provided
      }
      return true; // If no time fields are provided, we skip this check
    },
    {
      message: 'Client timezone is required if updating event date or times.',
      path: ['clientTimezone'],
    }
  );
export type UpdateCalendarEventInputSchema = z.infer<
  typeof updateCalendarEventInputSchema
>;

export const getCalendarEventsInputSchema = z.object({
  date: yearMonthDateSchema,
  timezone: z.string({ required_error: 'Client timezone is required.' }),
});
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
