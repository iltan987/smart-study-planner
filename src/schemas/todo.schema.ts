import { Category, Priority, Status } from '@/generated/prisma-client';
import { z } from 'zod';

export const createTodoSchema = z.object({
  title: z.string().trim().nonempty(),
  description: z.string().trim().nonempty().optional(),
  priority: z.nativeEnum(Priority).optional().default(Priority.medium),
  category: z.nativeEnum(Category).optional().default(Category.study),
  dueTime: z.coerce.date().optional(),
  duration: z.number().positive().optional(),
  status: z.nativeEnum(Status).optional().default(Status.pending),
});

export type CreateTodoSchema = z.infer<typeof createTodoSchema>;

export const markAsTodoSchema = z.object({
  todoId: z.string().cuid(),
  status: z.nativeEnum(Status),
});

export type MarkAsTodoSchema = z.infer<typeof markAsTodoSchema>;

export const getTodosInputSchema = z.object({
  start: z.coerce.date(),
  end: z.coerce.date(),
});

export type GetTodosInputSchema = z.infer<typeof getTodosInputSchema>;

export const getTodosResponseSchema = z.object({
  id: z.string().cuid(),
  title: z.string(),
  description: z.string().nullable().optional(),
  priority: z.nativeEnum(Priority).nullable().optional(),
  category: z.nativeEnum(Category).nullable().optional(),
  dueTime: z.coerce.date().nullable().optional(),
  duration: z.number().positive().nullable().optional(),
  status: z.nativeEnum(Status).nullable().optional(),
});

export type GetTodosResponseSchema = z.infer<typeof getTodosResponseSchema>;
