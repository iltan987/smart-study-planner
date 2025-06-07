import { getCalendarEvents as serverActionGetCalendarEvents } from '@/actions/calendar.action';
import type { ListCalendarEventsToolInput } from '@/schemas/ai-tools.schema';
import { listCalendarEventsParamsSchema } from '@/schemas/ai-tools.schema';
import type { GetCalendarEventsInputSchema as PrismaGetCalendarEventsInputSchema } from '@/schemas/calendar.schema';
import { endOfDay, isEqual, parseISO, startOfDay } from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

export const toolListCalendarEvents = {
  description:
    "Use this tool to retrieve a list of the user's calendar events within a given date range. This is useful for checking a user's schedule for a day, a week, or any custom period.",
  parameters: listCalendarEventsParamsSchema,
  execute: async ({
    userId,
    userTimezone,
    args,
  }: {
    userId: string;
    userTimezone: string;
    args: ListCalendarEventsToolInput;
  }): Promise<string> => {
    console.log(
      `TOOL CALL: get_calendar_events for user ${userId} with args:`,
      JSON.stringify(args, null, 2)
    );
    const { startDate, endDate } = args;

    // Validate date input formats YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return 'Error: The start date must be in the format YYYY-MM-DD.';
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return 'Error: The end date must be in the format YYYY-MM-DD.';
    }

    const parsedStartDate = fromZonedTime(parseISO(startDate), userTimezone);
    const parsedEndDate = fromZonedTime(
      endOfDay(parseISO(endDate)),
      userTimezone
    );

    const prismaGetCalendarInput: PrismaGetCalendarEventsInputSchema = {
      start: parsedStartDate,
      end: parsedEndDate,
    };

    const result = await serverActionGetCalendarEvents(prismaGetCalendarInput);

    if (result.success) {
      if (!result.data) {
        return `Error: The server did not return any calendar events. Please check your calendar settings or try again later.`;
      }
      if (result.data.length === 0)
        return `No calendar events found for the specified date range from ${startDate} to ${endDate}.`;

      const eventsString = result.data
        .map((event) => {
          const eventDateStr = formatInTimeZone(
            event.start,
            userTimezone,
            'MMM d'
          );
          const startTimeStr = formatInTimeZone(event.start, userTimezone, 'p');
          const endTimeStr = formatInTimeZone(event.end, userTimezone, 'p');

          const startOfEventDayUserTz = startOfDay(
            toZonedTime(event.start, userTimezone)
          );
          const endOfEventDayUserTz = endOfDay(
            toZonedTime(event.start, userTimezone)
          );

          const isEventAllDay =
            isEqual(
              toZonedTime(event.start, userTimezone),
              startOfEventDayUserTz
            ) &&
            isEqual(toZonedTime(event.end, userTimezone), endOfEventDayUserTz);

          if (isEventAllDay) {
            return `- "${event.title}" (all day on ${eventDateStr})`;
          } else if (isEqual(event.start, event.end)) {
            return `- "${event.title}" (on ${eventDateStr} at ${startTimeStr})`;
          } else {
            return `- "${event.title}" (on ${eventDateStr} from ${startTimeStr} to ${endTimeStr})`;
          }
        })
        .join('\n');

      const descriptionForAI = `from ${startDate} to ${endDate}`;
      return `Here are your calendar events ${descriptionForAI}:\n${eventsString}`;
    } else {
      const errorMsg =
        typeof result.error === 'string'
          ? result.error
          : JSON.stringify(result.error);
      console.error('Error from serverActionGetCalendarEvents:', errorMsg);
      return `Sorry, I couldn't retrieve your calendar events. ${errorMsg.includes('Invalid date') ? 'The date/time seems invalid.' : errorMsg}`;
    }
  },
};
