import { Category, Priority, Status } from '@/generated/prisma-client';
import { z } from 'zod';

export const dateTimeModification = z
  .object({
    duration_to_add: z
      .object({
        years: z.number().int().optional(),
        months: z.number().int().optional(),
        weeks: z.number().int().optional(),
        days: z.number().int().optional(),
        hours: z.number().int().optional(),
        minutes: z.number().int().optional(),
        seconds: z.number().int().optional(),
      })
      .optional(),
    duration_to_set: z
      .object({
        year: z.number().int().optional(),
        month: z.number().int().min(1).max(12).optional(),
        date: z.number().int().min(1).max(31).optional(),
        hours: z.number().int().min(0).max(23).optional(),
        minutes: z.number().int().min(0).max(59).optional(),
        seconds: z.number().int().min(0).max(59).optional().default(0),
      })
      .optional(),
  })
  .refine((data) => data.duration_to_add || data.duration_to_set, {
    message:
      "Either 'duration_to_add' or 'duration_to_set' (or both) must be provided for date/time modification.",
  });

export type DateTimeModificationSchema = z.infer<typeof dateTimeModification>;

// Base schema for common todo fields
const todoBaseSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().nullable().optional(),
  priority: z.nativeEnum(Priority).default(Priority.medium),
  category: z.nativeEnum(Category).default(Category.study),
  duration: z.number().positive().nullable().optional(),
  status: z.nativeEnum(Status).default(Status.pending),
});

// Schema for creating a new todo
export const createTodoSchema = todoBaseSchema.extend({
  dueTime: z.coerce.date().nullable().optional(),
});

export type CreateTodoSchema = z.infer<typeof createTodoSchema>;

// Schema for creating a new daily todo
export const createDailyTodoSchema = createTodoSchema.extend({
  dueTime: z
    .object({
      hours: z.number().min(0).max(23),
      minutes: z.number().min(0).max(59),
    })
    .nullable()
    .optional(),
});

export type CreateDailyTodoSchema = z.infer<typeof createDailyTodoSchema>;

// Schema for getting todos within a date range
export const getTodosInputSchema = z.object({
  start: z.coerce.date(),
  end: z.coerce.date(),
});

export type GetTodosInputSchema = z.infer<typeof getTodosInputSchema>;

// Schema for todo response
export const getTodosResponseSchema = todoBaseSchema.extend({
  id: z.string().cuid(),
  dueTime: z.coerce.date().nullable().optional(),
});

export type GetTodosResponseSchema = z.infer<typeof getTodosResponseSchema>;

export const getTodosResponseSchemaArray = z.array(getTodosResponseSchema);

export type GetTodosResponseSchemaArray = z.infer<
  typeof getTodosResponseSchemaArray
>;
