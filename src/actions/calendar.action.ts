'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type {
  CreateCalendarEventInputSchema,
  DeleteCalendarEventInputSchema,
  GetCalendarEventsInputSchema,
  UpdateCalendarEventInputSchema,
} from '@/schemas/calendar.schema';
import {
  createCalendarEventInputSchema,
  deleteCalendarEventInputSchema,
  getCalendarEventsInputSchema,
  updateCalendarEventInputSchema,
} from '@/schemas/calendar.schema';
import type { Result } from '@/types/response';
import { getUtcDateRangeForLocalDay, localToUtc } from '@/utils/date.util';
import type { CalendarEvent, Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { addDays } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

export async function getCalendarEvents(
  input: GetCalendarEventsInputSchema
): Promise<Result<CalendarEvent[], GetCalendarEventsInputSchema>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: 'Unauthorized',
    };
  }
  const userId = session.user.id;

  try {
    const validationResult = getCalendarEventsInputSchema.safeParse(input);

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.flatten(),
      };
    }

    const { date: weekStartDate, timezone } = validationResult.data;

    const { utcStart: weekUtcStartDate } = getUtcDateRangeForLocalDay(
      weekStartDate,
      timezone
    );

    const localWeekStartDate = new Date(
      weekStartDate.year,
      weekStartDate.month - 1,
      weekStartDate.date
    );
    const localWeekEndDate = addDays(localWeekStartDate, 6);

    const { utcEnd: weekUtcEndDate } = getUtcDateRangeForLocalDay(
      {
        year: localWeekEndDate.getFullYear(),
        month: localWeekEndDate.getMonth() + 1,
        date: localWeekEndDate.getDate(),
      },
      timezone
    );

    const events = await prisma.calendarEvent.findMany({
      where: {
        userId,
        startTime: { lt: weekUtcEndDate },
        endTime: { gt: weekUtcStartDate },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return {
      success: true,
      data: events,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid date')) {
      return {
        success: false,
        error: 'Date processing error: ' + error.message,
      };
    }
    console.error('Error fetching calendar events:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during fetching calendar events',
    };
  }
}

export async function createCalendarEvent(
  input: CreateCalendarEventInputSchema
): Promise<Result<CalendarEvent, CreateCalendarEventInputSchema>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: 'Unauthorized',
    };
  }
  const userId = session.user.id;

  try {
    const validationResult = createCalendarEventInputSchema.safeParse(input);

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.flatten(),
      };
    }

    const { title, eventDate, startTimeLocal, endTimeLocal, clientTimezone } =
      validationResult.data;

    // Convert local start and end datetimes to UTC
    // Both startTime and endTime are on the SAME local eventDate
    const utcStartTime = localToUtc(eventDate, clientTimezone, startTimeLocal);
    const utcEndTime = localToUtc(eventDate, clientTimezone, endTimeLocal); // Using same eventDate

    // Zod refine already ensures endTimeLocal > startTimeLocal.
    // An additional server-side check here.
    if (utcEndTime <= utcStartTime) {
      // This could happen due to DST transitions or issues with localToUtc if not robust,
      // or if refine logic was bypassed/incorrect.
      return {
        success: false,
        error:
          'Calculated UTC end time must be after UTC start time. Ensure times are valid for the given date and timezone.',
      };
    }

    const newEvent = await prisma.calendarEvent.create({
      data: {
        userId,
        title,
        startTime: utcStartTime,
        endTime: utcEndTime,
      },
    });

    return {
      success: true,
      data: newEvent,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid date')) {
      return {
        success: false,
        error: 'Date processing error: ' + error.message,
      };
    }
    console.error('Error creating calendar event:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during creating calendar event',
    };
  }
}

async function getCalendarEventAndCheckOwnership(
  eventId: string,
  userId: string
): Promise<
  | {
      error: string;
      isOwner: false;
    }
  | {
      isOwner: true;
      event: Pick<CalendarEvent, 'userId' | 'title' | 'startTime' | 'endTime'>;
    }
> {
  const event = await prisma.calendarEvent.findUnique({
    where: { id: eventId },
    select: {
      userId: true,
      title: true,
      startTime: true,
      endTime: true,
    },
  });

  if (!event) {
    return { error: 'Event not found', isOwner: false };
  }

  if (event.userId !== userId) {
    return { error: 'Forbidden', isOwner: false };
  }
  return { isOwner: true, event };
}

export async function deleteCalendarEvent(
  input: DeleteCalendarEventInputSchema
): Promise<Result<undefined, DeleteCalendarEventInputSchema>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: 'Unauthorized',
    };
  }
  const userId = session.user.id;

  const validationResult = deleteCalendarEventInputSchema.safeParse(input);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.flatten(),
    };
  }

  const { eventId } = validationResult.data;

  try {
    const ownership = await getCalendarEventAndCheckOwnership(eventId, userId);

    if (!ownership.isOwner) {
      return {
        success: false,
        error: ownership.error || 'Operation not allowed.',
      };
    }

    await prisma.calendarEvent.delete({
      where: { id: eventId },
      select: {
        id: true,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return {
        success: false,
        error: 'Event not found for deletion',
      };
    }
    console.error(`Error deleting calendar event ${eventId}:`, error);

    return {
      success: false,
      error: `An unexpected error occurred while deleting calendar event ${eventId}`,
    };
  }
}

export async function updateCalendarEvent(
  input: UpdateCalendarEventInputSchema
): Promise<Result<CalendarEvent, UpdateCalendarEventInputSchema>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: 'Unauthorized',
    };
  }
  const userId = session.user.id;

  const validationResult = updateCalendarEventInputSchema.safeParse(input);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.flatten(),
    };
  }

  const {
    eventId,
    title,
    eventDate,
    startTimeLocal,
    endTimeLocal,
    clientTimezone,
  } = validationResult.data;

  try {
    const ownership = await getCalendarEventAndCheckOwnership(eventId, userId);

    if (!ownership.isOwner) {
      return {
        success: false,
        error: ownership.error || 'Operation not allowed.',
      };
    }
    const existingEvent = ownership.event;

    let newStartDateTime: Date | undefined = undefined;
    let newEndDateTime: Date | undefined = undefined;

    // Build the updated start and end DateTimes
    if (eventDate || startTimeLocal) {
      // Start with existing date to avoid unwanted modifications when only time is modified
      const existingStartDateLocal = toZonedTime(
        existingEvent.startTime,
        clientTimezone!
      );

      const year = eventDate?.year ?? existingStartDateLocal.getFullYear();
      const month =
        (eventDate?.month ?? existingStartDateLocal.getMonth() + 1) - 1;
      const date = eventDate?.date ?? existingStartDateLocal.getDate();
      const hours = startTimeLocal?.hours ?? existingStartDateLocal.getHours();
      const minutes =
        startTimeLocal?.minutes ?? existingStartDateLocal.getMinutes();

      // Build date in local timezone
      const localStartDate = new Date(year, month, date, hours, minutes, 0, 0);

      // Convert local datetime to UTC
      newStartDateTime = fromZonedTime(localStartDate, clientTimezone!);
    }

    if (eventDate || endTimeLocal) {
      // Start with existing date to avoid unwanted modifications when only time is modified
      const existingEndDateLocal = toZonedTime(
        existingEvent.endTime,
        clientTimezone!
      );

      const year = eventDate?.year ?? existingEndDateLocal.getFullYear();
      const month =
        (eventDate?.month ?? existingEndDateLocal.getMonth() + 1) - 1; // Month is 0-indexed in JavaScript Date
      const date = eventDate?.date ?? existingEndDateLocal.getDate();
      const hours = endTimeLocal?.hours ?? existingEndDateLocal.getHours();
      const minutes =
        endTimeLocal?.minutes ?? existingEndDateLocal.getMinutes();

      // Build date in local timezone
      const localEndDate = new Date(year, month, date, hours, minutes, 0, 0);

      // Convert local datetime to UTC
      newEndDateTime = fromZonedTime(localEndDate, clientTimezone!);
    }

    // Validation
    if (
      newStartDateTime &&
      newEndDateTime &&
      newEndDateTime <= newStartDateTime
    ) {
      return {
        success: false,
        error: 'End time must be after start time',
      };
    }

    // Construct the update data object
    const updateData: Prisma.CalendarEventUpdateArgs['data'] = {};
    if (title !== undefined) {
      updateData.title = title;
    }
    if (newStartDateTime) {
      updateData.startTime = newStartDateTime;
    }
    if (newEndDateTime) {
      updateData.endTime = newEndDateTime;
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id: eventId, userId: userId },
      data: updateData,
    });

    return {
      success: true,
      data: updatedEvent,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('Invalid date') ||
        error.message.includes('Invalid timezone'))
    ) {
      return {
        success: false,
        error: 'Date/Time processing error: ' + error.message,
      };
    }
    console.error(`Error updating calendar event ${eventId}:`, error);
    return {
      success: false,
      error: `An expected error occured while updating calendar event ${eventId}`,
    };
  }
}
