'use server';

import { RESPONSE_MESSAGES } from '@/constants/response-messages';
import { PrismaClientKnownRequestError } from '@/generated/prisma-client/runtime/library';
import prisma from '@/lib/db';
import type {
  CreateTodoSchema,
  GetTodosResponseSchema,
  MarkAsTodoSchema,
} from '@/schemas/todo.schema';
import {
  createTodoSchema,
  getTodosResponseSchema,
  markAsTodoSchema,
} from '@/schemas/todo.schema';
import type { Response } from '@/types/response.type';

type CreateTodoFunction = (
  userId: string,
  data: CreateTodoSchema
) => Promise<Response<CreateTodoSchema, string>>;

export const createTodo: CreateTodoFunction = async (userId, data) => {
  try {
    const parsedData = createTodoSchema.safeParse(data);

    if (!parsedData.success) {
      return { success: false, error: parsedData.error.flatten() };
    }

    const todo = await prisma.todo.create({
      data: {
        User: {
          connect: { id: userId },
        },
        ...parsedData.data,
      },
      select: { id: true },
    });

    return {
      success: true,
      data: todo.id,
      message: RESPONSE_MESSAGES.TODO_CREATED,
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return {
          success: false,
          error: RESPONSE_MESSAGES.USER_NOT_FOUND,
        };
      }
    }

    return {
      success: false,
      error: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
    };
  }
};

type MarkAsFunction = (
  userId: string,
  data: MarkAsTodoSchema
) => Promise<Response<MarkAsTodoSchema>>;

export const markAs: MarkAsFunction = async (userId, data) => {
  try {
    const parsedData = markAsTodoSchema.safeParse(data);

    if (!parsedData.success) {
      return { success: false, error: parsedData.error.flatten() };
    }

    await prisma.todo.update({
      where: { id: data.todoId, userId: userId },
      data: {
        status: parsedData.data.status,
      },
      select: { id: true },
    });

    return {
      success: true,
      message: RESPONSE_MESSAGES.TODO_UPDATED,
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return {
          success: false,
          error: RESPONSE_MESSAGES.USER_NOT_FOUND,
        };
      }
    }

    return {
      success: false,
      error: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
    };
  }
};

type GetTodosFunction = (
  userId: string,
  start: Date,
  end: Date
) => Promise<Response<undefined, GetTodosResponseSchema[]>>;

export const getTodos: GetTodosFunction = async (userId, start, end) => {
  try {
    const todos = await prisma.todo.findMany({
      where: {
        userId,
        dueTime: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        category: true,
        dueTime: true,
        duration: true,
        status: true,
      },
    });

    // using getTodosSchema or z.array(getTodosSchema), todos should be parsed. But id should be todoId
    const parsedTodos = todos
      .map((todo) => {
        const parsedTodo = getTodosResponseSchema.safeParse({
          todoId: todo.id,
          ...todo,
        });
        if (parsedTodo.success) {
          return parsedTodo.data;
        } else {
          console.error(parsedTodo.error);
          return null;
        }
      })
      .filter((todo) => todo !== null) as GetTodosResponseSchema[];

    return {
      success: true,
      data: parsedTodos,
      message: RESPONSE_MESSAGES.TODOS_RETRIEVED,
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return {
          success: false,
          error: RESPONSE_MESSAGES.USER_NOT_FOUND,
        };
      }
    }

    return {
      success: false,
      error: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
    };
  }
};
