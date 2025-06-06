import { getCalendarEvents as serverActionGetCalendarEvents } from '@/actions/calendar.action';
import {
  getCalendarEventsToolSchema,
  type GetCalendarEventsToolInput,
} from '@/schemas/ai-tools.schema';
import type { GetCalendarEventsInputSchema as PrismaGetCalendarEventsInputSchema } from '@/schemas/calendar.schema';
import type { ProcessedAiDate } from '@/utils/date.util';
import { processAiDateTimeInput } from '@/utils/date.util';
import { endOfDay, isAfter, isEqual, startOfDay } from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

export const toolGetCalendarEvents = {
  description:
    "Retrieves events from the user's calendar for a specific day or a date range up to 7 days.",
  parameters: getCalendarEventsToolSchema,
  execute: async ({
    userId,
    userTimezone,
    currentServerDate,
    args,
  }: {
    userId: string;
    userTimezone: string;
    currentServerDate: Date;
    args: GetCalendarEventsToolInput;
  }): Promise<string> => {
    console.log(
      `TOOL CALL: get_calendar_events for user ${userId} with args:`,
      JSON.stringify(args, null, 2)
    );
    const { dateTime, dateRangeStart, dateRangeEnd, query, limit = 10 } = args;

    let filterRangeStartUTC: Date;
    let filterRangeEndUTC: Date;
    let descriptionForAI: string = '';

    const getDayBoundariesUTC = (
      processedDate: ProcessedAiDate
    ): { startUTC: Date; endUTC: Date } => {
      const localStart = startOfDay(processedDate.userLocalTime);
      const localEnd = endOfDay(processedDate.userLocalTime);
      return {
        startUTC: fromZonedTime(localStart, userTimezone),
        endUTC: fromZonedTime(localEnd, userTimezone),
      };
    };

    if (dateTime) {
      const processed = processAiDateTimeInput(
        dateTime,
        userTimezone,
        currentServerDate
      );
      if (processed) {
        descriptionForAI = `for ${formatInTimeZone(processed.userLocalTime, userTimezone, 'PPP')}`;
        const boundaries = getDayBoundariesUTC(processed);
        filterRangeStartUTC = boundaries.startUTC;
        filterRangeEndUTC = boundaries.endUTC;
      } else {
        return `Error: I couldn't understand the date "${JSON.stringify(dateTime)}" you provided for filtering calendar events.`;
      }
    } else if (dateRangeStart && dateRangeEnd) {
      const processedStart = processAiDateTimeInput(
        dateRangeStart,
        userTimezone,
        currentServerDate
      );
      const processedEnd = processAiDateTimeInput(
        dateRangeEnd,
        userTimezone,
        currentServerDate
      );

      if (processedStart && processedEnd) {
        descriptionForAI = `from ${formatInTimeZone(processedStart.userLocalTime, userTimezone, 'PPP')} to ${formatInTimeZone(processedEnd.userLocalTime, userTimezone, 'PPP')}`;
        // Use exact times if AI provided them and they are not "all-day" markers, otherwise start/end of respective days
        filterRangeStartUTC = processedStart.isAllDay
          ? fromZonedTime(
              startOfDay(processedStart.userLocalTime),
              userTimezone
            )
          : processedStart.finalDateUTC;
        filterRangeEndUTC = processedEnd.isAllDay
          ? fromZonedTime(endOfDay(processedEnd.userLocalTime), userTimezone)
          : processedEnd.finalDateUTC;

        if (isAfter(filterRangeStartUTC, filterRangeEndUTC)) {
          return `Error: The start of the date range (${formatInTimeZone(filterRangeStartUTC, userTimezone, 'Pp')}) cannot be after the end of the date range (${formatInTimeZone(filterRangeEndUTC, userTimezone, 'Pp')}).`;
        }

        // Validate 7-day limit for calendar queries (approximate, allows for slightly over due to timezones/DST)
        const MAX_RANGE_MS = 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000; // 7 days + 1 hour buffer
        if (
          filterRangeEndUTC.getTime() - filterRangeStartUTC.getTime() >
          MAX_RANGE_MS
        ) {
          return `Error: The date range for calendar events cannot exceed 7 days. You requested a range from ${formatInTimeZone(filterRangeStartUTC, userTimezone, 'PPP')} to ${formatInTimeZone(filterRangeEndUTC, userTimezone, 'PPP')}. Please specify a shorter range.`;
        }
      } else {
        return `Error: I couldn't understand the date range. Start: ${JSON.stringify(dateRangeStart)}, End: ${JSON.stringify(dateRangeEnd)}`;
      }
    } else {
      // Default to today if no specific date or range is given by AI
      descriptionForAI = 'for today (default)';
      const refDateInUserTz = toZonedTime(currentServerDate, userTimezone);
      const boundaries = getDayBoundariesUTC({
        userLocalTime: refDateInUserTz,
        finalDateUTC: currentServerDate,
        isAllDay: true,
      });
      filterRangeStartUTC = boundaries.startUTC;
      filterRangeEndUTC = boundaries.endUTC;
    }

    const prismaGetCalendarInput: PrismaGetCalendarEventsInputSchema = {
      start: filterRangeStartUTC,
      end: filterRangeEndUTC,
      ...(query ? { query } : {}),
      ...(limit ? { limit } : {}),
    };

    const result = await serverActionGetCalendarEvents(prismaGetCalendarInput);

    if (result.success) {
      if (!result.data) {
        return `Error: The server did not return any calendar events. Please check your calendar settings or try again later.`;
      }
      if (result.data.length === 0)
        return `No calendar events found ${descriptionForAI}.`;

      const eventsString = result.data
        .map((event) => {
          const eventDateStr = formatInTimeZone(
            event.start,
            userTimezone,
            'MMM d'
          );
          const startTimeStr = formatInTimeZone(event.start, userTimezone, 'p');
          const endTimeStr = formatInTimeZone(event.end, userTimezone, 'p');

          // Check if it's an all-day event for formatting the confirmation
          const startOfEventDayUserTz = startOfDay(
            toZonedTime(event.start, userTimezone)
          );
          const endOfEventDayUserTz = endOfDay(
            toZonedTime(event.start, userTimezone)
          ); // end of the *start* day

          const isEventAllDay =
            isEqual(
              toZonedTime(event.start, userTimezone),
              startOfEventDayUserTz
            ) &&
            isEqual(toZonedTime(event.end, userTimezone), endOfEventDayUserTz);

          if (isEventAllDay) {
            return `- "${event.title}" (all day on ${eventDateStr})`;
          } else {
            return `- "${event.title}" (on ${eventDateStr} from ${startTimeStr} to ${endTimeStr})`;
          }
        })
        .join('\n');

      return `Here are the calendar events I found ${descriptionForAI}:\n${eventsString}`;
    } else {
      const errorMsg =
        typeof result.error === 'string'
          ? result.error
          : JSON.stringify(result.error);
      console.error('Error from serverActionGetCalendarEvents:', errorMsg);
      return `Sorry, I couldn't retrieve calendar events ${descriptionForAI}. ${errorMsg}`;
    }
  },
};
