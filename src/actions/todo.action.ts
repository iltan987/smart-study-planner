'use server';

import { RESPONSE_MESSAGES } from '@/constants/response-messages';
import type { Status } from '@/generated/prisma-client';
import { PrismaClientKnownRequestError } from '@/generated/prisma-client/runtime/library';
import prisma from '@/lib/db';
import type {
  CreateDailyTodoSchema,
  CreateTodoSchema,
  GetTodosResponseSchemaArray,
} from '@/schemas/todo.schema';
import {
  createDailyTodoSchema,
  createTodoSchema,
  getTodosResponseSchemaArray,
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

type CreateDailyTodoFunction = (
  userId: string,
  data: CreateDailyTodoSchema
) => Promise<Response<CreateDailyTodoSchema, string>>;

export const createDailyTodo: CreateDailyTodoFunction = async (
  userId,
  data
) => {
  try {
    const parsedData = createDailyTodoSchema.safeParse(data);

    if (!parsedData.success) {
      return { success: false, error: parsedData.error.flatten() };
    }

    const { dueTime, ...rest } = parsedData.data;

    const dueTimeDate =
      dueTime && new Date(new Date().setHours(dueTime.hours, dueTime.minutes));

    const todo = await prisma.todo.create({
      data: {
        User: {
          connect: { id: userId },
        },
        ...rest,
        dueTime: dueTimeDate,
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
  todoId: string,
  newStatus: Status
) => Promise<Response<undefined>>;

export const markAs: MarkAsFunction = async (userId, todoId, newStatus) => {
  try {
    await prisma.todo.update({
      where: { id: todoId, userId: userId },
      data: {
        status: newStatus,
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
) => Promise<
  Response<GetTodosResponseSchemaArray, GetTodosResponseSchemaArray>
>;

export const getTodos: GetTodosFunction = async (userId, start, end) => {
  try {
    const todos = await prisma.todo.findMany({
      where: {
        userId,
        dueTime: {
          gte: start,
          lte: end,
        },
        isDeleted: false,
      },
      omit: {
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    const parsedTodos = getTodosResponseSchemaArray.safeParse(todos);

    if (!parsedTodos.success) {
      return {
        success: false,
        error: parsedTodos.error.flatten(),
      };
    }

    return {
      success: true,
      data: parsedTodos.data,
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

type DeleteTodoFunction = (
  userId: string,
  todoId: string
) => Promise<Response<undefined>>;

export const deleteTodo: DeleteTodoFunction = async (userId, todoId) => {
  try {
    await prisma.todo.update({
      where: { id: todoId, userId: userId },
      data: { isDeleted: true },
      select: { id: true },
    });

    return {
      success: true,
      message: RESPONSE_MESSAGES.TODO_DELETED,
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
