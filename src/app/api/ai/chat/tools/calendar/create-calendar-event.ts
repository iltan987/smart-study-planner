import { createCalendarEvent as serverActionCreateCalendarEvent } from '@/actions/calendar.action';
import type { CreateCalendarEventToolInput } from '@/schemas/ai-tools.schema';
import { createCalendarEventParamsSchema } from '@/schemas/ai-tools.schema';
import type { CreateCalendarEventInputSchema as PrismaCreateCalendarEventInputSchema } from '@/schemas/calendar.schema';
import { endOfDay, isBefore, isEqual, parseISO, startOfDay } from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

export const toolCreateCalendarEvent = {
  description:
    "Use this tool to create a new, time-blocked event in the user's calendar. This is for events with a fixed duration, like a lecture, meeting, or appointment. All fields are required.",
  parameters: createCalendarEventParamsSchema,
  execute: async ({
    userId,
    userTimezone,
    args,
  }: {
    userId: string;
    userTimezone: string;
    args: CreateCalendarEventToolInput;
  }): Promise<string> => {
    console.log(
      `TOOL CALL: create_calendar_event for user ${userId} with args:`,
      JSON.stringify(args, null, 2)
    );
    const { title, date, startTime, endTime } = args;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return 'Error: The date must be in the format YYYY-MM-DD.';
    }
    if (!/^\d{2}:\d{2}$/.test(startTime)) {
      return 'Error: The start time must be in the format HH:mm (24-hour format).';
    }
    if (!/^\d{2}:\d{2}$/.test(endTime)) {
      return 'Error: The end time must be in the format HH:mm (24-hour format).';
    }

    const parsedDate = parseISO(date);
    if (isNaN(parsedDate.getTime())) {
      return 'Error: The provided date is invalid.';
    }

    const finalStartTime = fromZonedTime(
      parseISO(`${date}T${startTime}`),
      userTimezone
    );

    const finalEndTime = fromZonedTime(
      parseISO(`${date}T${endTime}`),
      userTimezone
    );

    // Final validation: end time must be strictly after start time.
    if (isBefore(finalStartTime, finalEndTime)) {
      return `Error: The event's calculated end time (${formatInTimeZone(toZonedTime(finalEndTime, userTimezone), userTimezone, 'Pp')}) must be after its start time (${formatInTimeZone(toZonedTime(finalStartTime, userTimezone), userTimezone, 'Pp')}). Please check the times or duration.`;
    }

    const prismaCalendarInput: PrismaCreateCalendarEventInputSchema = {
      title,
      start: finalStartTime,
      end: finalEndTime,
    };

    const result = await serverActionCreateCalendarEvent(prismaCalendarInput);

    if (result.success) {
      if (!result.data) {
        return `Error: The server did not return any calendar event data. Please check your calendar settings or try again later.`;
      }
      const startStr = formatInTimeZone(result.data.start, userTimezone, 'Pp');
      const endStr = formatInTimeZone(result.data.end, userTimezone, 'p'); // Use 'p' for end time if on same day
      const dayStr = formatInTimeZone(result.data.start, userTimezone, 'PPP');
      // Check if it's effectively an all-day event for confirmation message
      const isEffectivelyAllDay =
        isEqual(
          startOfDay(toZonedTime(result.data.start, userTimezone)),
          toZonedTime(result.data.start, userTimezone)
        ) &&
        isEqual(
          endOfDay(toZonedTime(result.data.end, userTimezone)),
          toZonedTime(result.data.end, userTimezone)
        );

      if (isEffectivelyAllDay) {
        return `Event "${result.data.title}" created successfully for the whole day on ${dayStr}. ID: ${result.data.id}.`;
      } else {
        return `Event "${result.data.title}" created successfully on ${dayStr} from ${startStr.split(' at ')[1] || startStr} to ${endStr}. ID: ${result.data.id}.`;
      }
    } else {
      const errorMsg =
        typeof result.error === 'string'
          ? result.error
          : JSON.stringify(result.error);
      console.error('Error from serverActionCreateCalendarEvent:', errorMsg);
      return `Sorry, I couldn't create the calendar event. ${errorMsg.includes('Invalid date') ? 'The date/time seems invalid.' : errorMsg}`;
    }
  },
};
