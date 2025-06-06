import { TodoCategory, TodoPriority, TodoStatus } from '@prisma/client';
import { z } from 'zod';
import { yearMonthDate } from './time.schema';

export const addTodoFormSchema = z.object({
  title: z
    .string()
    .nonempty({ message: 'Title is required.' })
    .max(255, { message: 'Title must be 255 characters or less.' })
    .refine((val) => val.trim().length > 0, {
      message: 'Title is required.',
    }),
  description: z
    .string()
    .max(1000, { message: 'Description must be 1000 characters or less.' }),
  timeOfDay: z.string(),
  duration: z.string(),
  priority: z.nativeEnum(TodoPriority),
  category: z.nativeEnum(TodoCategory),
  status: z.nativeEnum(TodoStatus),
});
export type AddTodoFormSchema = z.infer<typeof addTodoFormSchema>;

export const createTodoInputSchema = z
  .object({
    title: z
      .string()
      .nonempty({ message: 'Title is required.' })
      .max(255, { message: 'Title must be 255 characters or less.' })
      .refine((val) => val.trim().length > 0, {
        message: 'Title is required.',
      }),
    description: z
      .string()
      .max(1000, { message: 'Description must be 1000 characters or less.' })
      .transform((val) => (val === '' ? undefined : val))
      .optional(),
    date: yearMonthDate.optional(), // For all-day todos
    dueTime: z.date().optional(),
    duration: z
      .number()
      .positive({ message: 'Duration must be a positive number.' })
      .optional(),
    priority: z
      .nativeEnum(TodoPriority)
      .default(TodoPriority.MEDIUM)
      .optional(),
    category: z.nativeEnum(TodoCategory).default(TodoCategory.STUDY).optional(),
    status: z.nativeEnum(TodoStatus).default(TodoStatus.PENDING).optional(),
  })
  .refine((data) => data.date || data.dueTime, {
    message: 'Either date or dueTime must be provided.',
  });
export type CreateTodoInputSchema = z.infer<typeof createTodoInputSchema>;

export const deleteTodoInputSchema = z.object({
  todoId: z.string().cuid({
    message: 'Todo ID must be a valid CUID.',
  }),
});
export type DeleteTodoInputSchema = z.infer<typeof deleteTodoInputSchema>;

export const updateTodoStatusOnlySchema = z.object({
  todoId: z.string().cuid({
    message: 'Todo ID must be a valid CUID.',
  }),
  status: z.nativeEnum(TodoStatus, {
    required_error: 'Status is required.',
  }),
});
export type UpdateTodoStatusOnlyInput = z.infer<
  typeof updateTodoStatusOnlySchema
>;

export const getTodosInputSchema = z
  .object({
    date: yearMonthDate,
    start: z.date(),
    end: z.date(),
    status: z.nativeEnum(TodoStatus).optional(),
    priority: z.nativeEnum(TodoPriority).optional(),
    category: z.nativeEnum(TodoCategory).optional(),
    query: z.string().max(255).optional(),
    limit: z.number().int().positive().max(100).optional(),
  })
  .refine(
    (data) => {
      const start = data.start.getTime();
      const end = data.end.getTime();
      return end - start <= 24 * 60 * 60 * 1000;
    },
    {
      message: 'Time range must be less than 24 hours.',
    }
  );
export type GetTodosInputSchema = z.infer<typeof getTodosInputSchema>;
