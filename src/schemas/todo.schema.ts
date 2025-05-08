import { Category, Priority, Status } from '@/generated/prisma-client';
import { z } from 'zod';

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
