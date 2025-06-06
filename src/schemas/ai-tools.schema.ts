import { TodoCategory, TodoPriority, TodoStatus } from '@prisma/client';
import { z } from 'zod';

const durationSchemaContents = {
  years: z
    .number()
    .int()
    .optional()
    .describe("Number of years to add/set. Can be negative for 'add'."),
  months: z
    .number()
    .int()
    .optional()
    .describe(
      "Number of months to add/set. Can be negative for 'add'. For 'set', use 1 for January, 12 for December."
    ),
  weeks: z
    .number()
    .int()
    .optional()
    .describe("Number of weeks to add/set. Can be negative for 'add'."),
  days: z
    .number()
    .int()
    .optional()
    .describe("Number of days to add/set. Can be negative for 'add'."),
  hours: z
    .number()
    .int()
    .min(0)
    .max(23)
    .optional()
    .describe(
      "Hour component to set (0-23) or add. For 'set', 24-hour format."
    ),
  minutes: z
    .number()
    .int()
    .min(0)
    .max(59)
    .optional()
    .describe('Minute component to set (0-59) or add.'),
  seconds: z
    .number()
    .int()
    .min(0)
    .max(59)
    .optional()
    .describe(
      "Second component to set (0-59) or add. Defaults to 0 if not specified for a 'set' time."
    ),
};

const durationSchema = z
  .object(durationSchemaContents)
  .describe(
    "A duration object. All fields are optional numbers. For 'set.months', use 1-12. For 'add', values can be negative."
  );

export const aiDateTimeInputSchema = z
  .object({
    add: durationSchema
      .optional()
      .describe(
        "Use for relative shifts from the current user time (e.g., {days: 1} for 'tomorrow'). Do NOT use 'add' for specific times of day like '10 a.m.' unless user says 'in 10 hours'."
      ),
    set: durationSchema
      .optional()
      .describe(
        "Use for setting absolute components of the target date/time (e.g., {hours: 17} for '5 PM'; {year: 2024, month: 7, day: 20} for 'July 20, 2024'). Month is 1-12."
      ),
  })
  .refine((data) => data.add || data.set, {
    message:
      "For any date/time input, you must provide at least an 'add' or a 'set' property, or both.",
  })
  .describe(
    "Object for specifying date/time. For 'tomorrow at 10 AM', use {add: {days: 1}, set: {hours: 10, minutes: 0}}. For 'next Monday', calculate days to add from the current day of the week (provided in system context) and use {add: {days: X}}."
  );

export type AiDateTimeInput = z.infer<typeof aiDateTimeInputSchema>;

export const createTodoToolSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .describe('The title of the todo item. This is required.'),
    description: z
      .string()
      .optional()
      .describe('A more detailed description of the todo item.'),
    dateTime: aiDateTimeInputSchema
      .optional()
      .describe(
        "The due date/time for the todo. Must be an AiDateTimeInput object. For 'tomorrow at 10 AM', use {add: {days: 1}, set: {hours: 10, minutes: 0}}. See main AiDateTimeInput description for details."
      ),
    duration: z
      .number()
      .int()
      .positive()
      .optional()
      .describe(
        'Estimated duration in minutes to complete the todo (e.g., 30 for 30 minutes).'
      ),
    priority: z
      .nativeEnum(TodoPriority)
      .optional()
      .describe(
        `Priority of the todo. Default is MEDIUM. Available: ${Object.values(TodoPriority).join(', ')}`
      ),
    category: z
      .nativeEnum(TodoCategory)
      .optional()
      .describe(
        `Category of the todo. Default is STUDY. Available: ${Object.values(TodoCategory).join(', ')}`
      ),
    status: z
      .nativeEnum(TodoStatus)
      .optional()
      .describe(
        `Status of the todo. Default is PENDING. Available: ${Object.values(TodoStatus).join(', ')}`
      ),
  })
  .describe("Creates a new todo item in the user's planner.");
export type CreateTodoToolInput = z.infer<typeof createTodoToolSchema>;

export const getTodosToolSchema = z
  .object({
    dateTime: aiDateTimeInputSchema
      .optional()
      .describe(
        "Specific date to retrieve todos for (e.g., for 'today', use {add: {days:0}} or calculate appropriate 'set'). Format as AiDateTimeInput object."
      ),
    dateRangeStart: aiDateTimeInputSchema
      .optional()
      .describe(
        'The start of a date range to query todos. Format as AiDateTimeInput object.'
      ),
    dateRangeEnd: aiDateTimeInputSchema
      .optional()
      .describe(
        'The end of a date range to query todos. Format as AiDateTimeInput object.'
      ),
    status: z
      .nativeEnum(TodoStatus)
      .optional()
      .describe(
        `Filter todos by status. Available: ${Object.values(TodoStatus).join(', ')}`
      ),
    priority: z
      .nativeEnum(TodoPriority)
      .optional()
      .describe(
        `Filter todos by priority. Available: ${Object.values(TodoPriority).join(', ')}`
      ),
    category: z
      .nativeEnum(TodoCategory)
      .optional()
      .describe(
        `Filter todos by category. Available: ${Object.values(TodoCategory).join(', ')}`
      ),
    limit: z
      .number()
      .int()
      .positive()
      .optional()
      .default(10)
      .describe('Maximum number of todos to return. Defaults to 10.'),
    query: z
      .string()
      .optional()
      .describe(
        "A general query string to search in todo titles or descriptions (e.g., 'history essay', 'math homework')."
      ),
  })
  .describe(
    "Retrieves a list of the user's todos based on specified criteria. All parameters are optional. Use AiDateTimeInput for all date parameters."
  );
export type GetTodosToolInput = z.infer<typeof getTodosToolSchema>;

export const createCalendarEventToolSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .describe('The title of the calendar event. This is required.'),
    startTime: aiDateTimeInputSchema.describe(
      'The specific start date and time of the event. This is required. If the user provides only a date, either clarify for a time or assume a default start time (e.g., beginning of the day for an all-day event, or 9 AM for a general marker) when constructing this object.'
    ),
    endTime: aiDateTimeInputSchema
      .optional()
      .describe(
        "The end date and time of the event. Must be on the same calendar day as startTime. If omitted, 'durationInMinutes' can be used, or a default duration will apply."
      ),
    durationInMinutes: z
      .number()
      .int()
      .positive()
      .optional()
      .describe(
        "The duration of the event in minutes (e.g., 60 for 1 hour). Used if 'endTime' is not specified for a timed event."
      ),
  })
  .describe(
    "Creates a new event in the user's calendar. All events are for a single calendar day."
  );
export type CreateCalendarEventToolInput = z.infer<
  typeof createCalendarEventToolSchema
>;

export const getCalendarEventsToolSchema = z
  .object({
    dateTime: aiDateTimeInputSchema
      .optional()
      .describe(
        'Specific single date to retrieve events for. Format as AiDateTimeInput object.'
      ),
    dateRangeStart: aiDateTimeInputSchema
      .optional()
      .describe(
        'The start of a date range for querying events (up to 7 days total). Format as AiDateTimeInput object.'
      ),
    dateRangeEnd: aiDateTimeInputSchema
      .optional()
      .describe(
        'The end of a date range for querying events (up to 7 days total). Format as AiDateTimeInput object.'
      ),
    query: z
      .string()
      .optional()
      .describe(
        'A general query string to search in event titles or descriptions.'
      ),
    limit: z
      .number()
      .int()
      .positive()
      .optional()
      .default(10)
      .describe('Maximum number of events to return. Defaults to 10.'),
  })
  .describe(
    "Retrieves events from the user's calendar. Can query for a single day or a range up to 7 days."
  );
export type GetCalendarEventsToolInput = z.infer<
  typeof getCalendarEventsToolSchema
>;

export const saveNoteToolSchema = z
  .object({
    topic: z
      .string()
      .min(1)
      .describe(
        "A brief, descriptive topic or category for the note (e.g., 'User Preferences', 'Project X Details', 'Study Habits'). This is required."
      ),
    content: z
      .string()
      .min(1)
      .describe(
        'The actual content of the note the AI wants to remember about the user or conversation. This is required.'
      ),
  })
  .describe(
    'Saves a piece of information (a note) that the AI should remember about the user for future interactions. Use this to recall user preferences, important project details, or recurring patterns.'
  );
export type SaveNoteToolInput = z.infer<typeof saveNoteToolSchema>;

export const getNotesToolSchema = z
  .object({
    topic: z
      .string()
      .optional()
      .describe(
        'Optional topic to search for specific notes. If omitted, might return general or all notes (respecting limits).'
      ),
    keywords: z
      .array(z.string())
      .optional()
      .describe(
        'Keywords to search within note content. Returns notes containing any of these keywords.'
      ),
    limit: z
      .number()
      .int()
      .positive()
      .optional()
      .default(5)
      .describe('Maximum number of notes to return. Defaults to 5.'),
  })
  .describe(
    'Retrieves previously saved notes about the user, optionally filtered by topic or keywords.'
  );
export type GetNotesToolInput = z.infer<typeof getNotesToolSchema>;
