/*
CREATING
    title: string, required, min length 1
    description: string, optional
    priority: enum: ["low", "medium", "high"], optional, default: "medium"
    category: enum: ["study", "assignment", "exam", "work", "gym", "other"], optional, default: "study"
    dueTime: date, optional
    duration: positive number, optional
    status: enum: ["pending", "completed", "missed"], optional, default: "pending"

UPDATING
    status: enum: ["pending", "completed", "missed"], required
*/

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

export const getTodosResponseSchema = createTodoSchema.extend({
  id: z.string().cuid(),
});

export type GetTodosResponseSchema = z.infer<typeof getTodosResponseSchema>;
