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
import type { CalendarEvent } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export async function getCalendarEvents(
  input: GetCalendarEventsInputSchema
): Promise<Result<CalendarEvent[], GetCalendarEventsInputSchema>> {
  const session = await auth();
  if (!session?.user.id) {
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

    const { start, end } = validationResult.data;

    const events = await prisma.calendarEvent.findMany({
      where: {
        userId,
        start: {
          gte: start,
          lte: end,
        },
        end: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        start: 'asc',
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
  if (!session?.user.id) {
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

    const newEvent = await prisma.calendarEvent.create({
      data: {
        userId,
        ...validationResult.data,
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
    }
> {
  const event = await prisma.calendarEvent.findUnique({
    where: { id: eventId },
    select: {
      userId: true,
    },
  });

  if (!event) {
    return { error: 'Event not found', isOwner: false };
  }

  if (event.userId !== userId) {
    return { error: 'Forbidden', isOwner: false };
  }

  return { isOwner: true };
}

export async function deleteCalendarEvent(
  input: DeleteCalendarEventInputSchema
): Promise<Result<undefined, DeleteCalendarEventInputSchema>> {
  const session = await auth();
  if (!session?.user.id) {
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
  if (!session?.user.id) {
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

  const { eventId, title, start, end } = validationResult.data;

  try {
    const ownership = await getCalendarEventAndCheckOwnership(eventId, userId);

    if (!ownership.isOwner) {
      return {
        success: false,
        error: ownership.error || 'Operation not allowed.',
      };
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id: eventId, userId: userId },
      data: {
        title,
        start,
        end,
      },
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
