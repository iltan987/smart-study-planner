import { TodoCategory, TodoPriority, TodoStatus } from '@prisma/client';
import { z } from 'zod';

export const createTodoParamsSchema = z
  .object({
    title: z
      .string()
      .describe(
        "The main subject or title of the to-do item. This is the only mandatory field. Extract it directly from the user's request (e.g., 'Submit calculus assignment')."
      ),
    description: z
      .string()
      .optional()
      .describe(
        "Optional additional details, notes, or context about the to-do item. For example, if the user says 'remind me to read chapter 5 for philosophy, the one about existentialism', the title would be 'Read chapter 5 for philosophy' and the description could be 'The chapter about existentialism'."
      ),
    date: z
      .string()
      .describe(
        "The specific date for the to-do item in 'YYYY-MM-DD' format. If the user doesn't specify a date, infer it as today's date based on the reference time."
      ),
    dueTime: z
      .string()
      .optional()
      .describe(
        "The specific time the to-do is due, in 'HH:mm' (24-hour) format. IMPORTANT: If the user does not specify a time (e.g., 'remind me to do laundry tomorrow'), this field MUST be left null. A null value signifies an 'all-day' to-do."
      ),
    duration: z
      .number()
      .optional()
      .describe(
        "The estimated time in minutes required to complete the task. Infer this from phrases like 'study for 2 hours' or 'a 30-minute workout'."
      ),
    priority: z
      .nativeEnum(TodoPriority)
      .optional()
      .describe(
        "The urgency of the to-do. Map the user's language to the enum values. For example: 'urgent', 'important', 'ASAP' -> HIGH. 'not that important', 'whenever' -> LOW. Default to MEDIUM if not specified or unclear."
      ),
    category: z
      .nativeEnum(TodoCategory)
      .describe(
        `The type of the to-do. Classify the user's request into one of the available categories. If the user mentions an 'assignment', 'paper', or 'problem set', use ASSIGNMENT. If they mention 'prepare for', 'review for', or 'midterm/final', use EXAM. For general academic tasks, use ${TodoCategory.STUDY}. For non-academic tasks, use ${TodoCategory.OTHER}. If unsure, ask the user for clarification.`
      ),
    status: z
      .nativeEnum(TodoStatus)
      .optional()
      .describe(
        "The initial status of the to-do. When creating a new to-do, this should always be 'PENDING'."
      ),
  })
  .describe(
    'A structured representation of a single to-do item, containing all its properties like title, timing, priority, and category.'
  );
export type CreateTodoToolInput = z.infer<typeof createTodoParamsSchema>;

export const listTodosParamsSchema = z
  .object({
    date: z
      .string()
      .describe(
        "The single, specific date for which to fetch to-do items, in 'YYYY-MM-DD' format. This field is required. Infer the date from the user's request (e.g., 'today', 'tomorrow', 'December 5th')."
      ),
  })
  .describe(
    "Specifies the exact date for which to query the user's to-do list."
  );
export type ListTodosToolInput = z.infer<typeof listTodosParamsSchema>;

export const createCalendarEventParamsSchema = z
  .object({
    title: z
      .string()
      .describe(
        "The title of the calendar event, such as 'Psychology 101 Lecture' or 'Team Meeting'."
      ),
    date: z
      .string()
      .describe(
        "The specific date for the event in 'YYYY-MM-DD' format. All calendar events must occur on a single day."
      ),
    startTime: z
      .string()
      .describe(
        "The mandatory start time of the event in 'HH:mm' (24-hour) format. Extract this from the user's prompt (e.g., 'from 2pm to 4pm', start time is '14:00')."
      ),
    endTime: z
      .string()
      .describe(
        "The mandatory end time of the event in 'HH:mm' (24-hour) format. It must be after the start time. Extract this from the user's prompt (e.g., 'from 2pm to 4pm', end time is '16:00')."
      ),
  })
  .describe(
    'A structured representation of a single calendar event with a mandatory title, date, start time, and end time.'
  );
export type CreateCalendarEventToolInput = z.infer<
  typeof createCalendarEventParamsSchema
>;

export const listCalendarEventsParamsSchema = z
  .object({
    startDate: z
      .string()
      .describe(
        "The beginning of the date range to fetch calendar events from, in 'YYYY-MM-DD' format. For relative terms like 'this week', this would be the date of the most recent Monday."
      ),
    endDate: z
      .string()
      .describe(
        "The end of the date range to fetch calendar events from, in 'YYYY-MM-DD' format. For relative terms like 'this week', this would be the date of the upcoming Sunday."
      ),
  })
  .describe(
    'Defines the time period for fetching calendar events, specified by a start and end date.'
  );
export type ListCalendarEventsToolInput = z.infer<
  typeof listCalendarEventsParamsSchema
>;
