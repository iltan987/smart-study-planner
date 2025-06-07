import { createCalendarEvent as serverActionCreateCalendarEvent } from '@/actions/calendar.action';
import type { CreateCalendarEventToolInput } from '@/schemas/ai-tools.schema';
import { createCalendarEventParamsSchema } from '@/schemas/ai-tools.schema';
import type { CreateCalendarEventInputSchema as PrismaCreateCalendarEventInputSchema } from '@/schemas/calendar.schema';
import type { CalendarEvent } from '@prisma/client';
import { isBefore, parseISO } from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

type CreateCalendarEventToolResultItem = Pick<
  CalendarEvent,
  'title' | 'start' | 'end'
>;

interface CreateCalendarEventToolResult {
  success: boolean;
  event?: CreateCalendarEventToolResultItem;
  error?: string;
}

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
  }): Promise<CreateCalendarEventToolResult> => {
    console.log(
      `TOOL CALL: create_calendar_event for user ${userId} with args:`,
      JSON.stringify(args, null, 2)
    );
    const { title, date, startTime, endTime } = args;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return {
        success: false,
        error: 'Error: The date must be in the format YYYY-MM-DD.',
      };
    }
    if (!/^\d{2}:\d{2}$/.test(startTime)) {
      return {
        success: false,
        error:
          'Error: The start time must be in the format HH:mm (24-hour format).',
      };
    }
    if (!/^\d{2}:\d{2}$/.test(endTime)) {
      return {
        success: false,
        error:
          'Error: The end time must be in the format HH:mm (24-hour format).',
      };
    }

    const parsedDate = parseISO(date);
    if (isNaN(parsedDate.getTime())) {
      return {
        success: false,
        error: 'Error: The provided date is invalid.',
      };
    }

    const finalStartTime = fromZonedTime(
      parseISO(`${date}T${startTime}`),
      userTimezone
    );

    const finalEndTime = fromZonedTime(
      parseISO(`${date}T${endTime}`),
      userTimezone
    );

    if (isBefore(finalEndTime, finalStartTime)) {
      return {
        success: false,
        error: `Error: The event's calculated end time (${formatInTimeZone(toZonedTime(finalEndTime, userTimezone), userTimezone, 'Pp')}) must be after its start time (${formatInTimeZone(toZonedTime(finalStartTime, userTimezone), userTimezone, 'Pp')}). Please check the times.`,
      };
    }

    const prismaCalendarInput: PrismaCreateCalendarEventInputSchema = {
      title,
      start: finalStartTime,
      end: finalEndTime,
    };

    const result = await serverActionCreateCalendarEvent(prismaCalendarInput);

    if (result.success) {
      if (!result.data) {
        return {
          success: false,
          error:
            'Error: The server did not return any calendar event data. Please check your calendar settings or try again later.',
        };
      }
      return {
        success: true,
        event: {
          title: result.data.title,
          start: result.data.start,
          end: result.data.end,
        },
      };
    } else {
      const errorMsg =
        typeof result.error === 'string'
          ? result.error
          : JSON.stringify(result.error);
      console.error('Error from serverActionCreateCalendarEvent:', errorMsg);
      return {
        success: false,
        error: `Sorry, I couldn't create the calendar event. ${errorMsg.includes('Invalid date') ? 'The date/time seems invalid.' : errorMsg}`,
      };
    }
  },
};
