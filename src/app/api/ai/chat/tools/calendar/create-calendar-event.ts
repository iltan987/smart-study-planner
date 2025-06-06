import { createCalendarEvent as serverActionCreateCalendarEvent } from '@/actions/calendar.action';
import type { CreateCalendarEventToolInput } from '@/schemas/ai-tools.schema';
import { createCalendarEventToolSchema } from '@/schemas/ai-tools.schema';
import type { CreateCalendarEventInputSchema as PrismaCreateCalendarEventInputSchema } from '@/schemas/calendar.schema';
import { processAiDateTimeInput } from '@/utils/date.util';
import { addMinutes, endOfDay, isAfter, isEqual, startOfDay } from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

export const toolCreateCalendarEvent = {
  description:
    "Creates a new event in the user's calendar. Events must occur on a single calendar day.",
  parameters: createCalendarEventToolSchema,
  execute: async ({
    userId,
    userTimezone,
    currentServerDate,
    args,
  }: {
    userId: string;
    userTimezone: string;
    currentServerDate: Date;
    args: CreateCalendarEventToolInput;
  }): Promise<string> => {
    console.log(
      `TOOL CALL: create_calendar_event for user ${userId} with args:`,
      JSON.stringify(args, null, 2)
    );
    const {
      title,
      startTime: aiStartTime,
      endTime: aiEndTime,
      durationInMinutes,
    } = args;

    const processedStartTime = processAiDateTimeInput(
      aiStartTime,
      userTimezone,
      currentServerDate
    );
    if (!processedStartTime) {
      return `Error: I couldn't understand the start time for the event. Please provide a clear date and, if applicable, a time. You provided: ${JSON.stringify(aiStartTime)}`;
    }

    let finalEndTimeUTC: Date;
    const eventDayStartLocal = startOfDay(processedStartTime.userLocalTime); // The calendar day of the event in user's TZ

    if (aiEndTime) {
      const processedEndTime = processAiDateTimeInput(
        aiEndTime,
        userTimezone,
        currentServerDate
      );
      if (!processedEndTime) {
        return `Error: I couldn't understand the end time for the event. You provided: ${JSON.stringify(aiEndTime)}`;
      }
      // Enforce that the event ends on the same calendar day it starts, in user's local time.
      if (
        !isEqual(startOfDay(processedEndTime.userLocalTime), eventDayStartLocal)
      ) {
        return `Error: The event's end time must be on the same calendar day as its start time. The event starts on ${formatInTimeZone(eventDayStartLocal, userTimezone, 'PPP')}. Please provide an end time on this date.`;
      }
      finalEndTimeUTC = processedEndTime.finalDateUTC;
    } else if (durationInMinutes) {
      finalEndTimeUTC = addMinutes(
        processedStartTime.finalDateUTC,
        durationInMinutes
      );
      // Check if the calculated end time spills into the next day in the user's local timezone.
      const calculatedEndUserLocal = toZonedTime(finalEndTimeUTC, userTimezone);
      if (!isEqual(startOfDay(calculatedEndUserLocal), eventDayStartLocal)) {
        // If it spills, cap it at the end of the event's start day.
        finalEndTimeUTC = fromZonedTime(
          endOfDay(processedStartTime.userLocalTime),
          userTimezone
        );
        console.warn(
          `Calendar event "${title}" duration of ${durationInMinutes}min from ${formatInTimeZone(processedStartTime.userLocalTime, userTimezone, 'Pp')} crossed midnight in user's timezone. Capped to end of day.`
        );
      }
    } else {
      // No endTime and no durationInMinutes.
      if (processedStartTime.isAllDay) {
        // If AI implied an all-day start (e.g., by not setting time components for startTime),
        // the event spans the entire day.
        // processAiDateTimeInput sets `userLocalTime` to start of day if `isAllDay` is true.
        // So, `processedStartTime.finalDateUTC` is start-of-day UTC.
        // `finalEndTimeUTC` should be end-of-day UTC for that same local day.
        finalEndTimeUTC = fromZonedTime(
          endOfDay(processedStartTime.userLocalTime),
          userTimezone
        );
      } else {
        // It's a timed event, but no end/duration given. Default to a 60-minute duration.
        finalEndTimeUTC = addMinutes(processedStartTime.finalDateUTC, 60);
        const calculatedEndUserLocal = toZonedTime(
          finalEndTimeUTC,
          userTimezone
        );
        if (!isEqual(startOfDay(calculatedEndUserLocal), eventDayStartLocal)) {
          finalEndTimeUTC = fromZonedTime(
            endOfDay(processedStartTime.userLocalTime),
            userTimezone
          );
        }
      }
    }

    // Final validation: end time must be strictly after start time.
    if (!isAfter(finalEndTimeUTC, processedStartTime.finalDateUTC)) {
      return `Error: The event's calculated end time (${formatInTimeZone(toZonedTime(finalEndTimeUTC, userTimezone), userTimezone, 'Pp')}) must be after its start time (${formatInTimeZone(processedStartTime.userLocalTime, userTimezone, 'Pp')}). Please check the times or duration.`;
    }

    const prismaCalendarInput: PrismaCreateCalendarEventInputSchema = {
      title,
      start: processedStartTime.finalDateUTC,
      end: finalEndTimeUTC,
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
