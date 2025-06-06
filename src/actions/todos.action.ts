'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type {
  CreateTodoInputSchema,
  DeleteTodoInputSchema,
  GetTodosInputSchema,
  UpdateTodoStatusOnlyInput,
} from '@/schemas/todos.schema';
import {
  createTodoInputSchema,
  deleteTodoInputSchema,
  getTodosInputSchema,
  updateTodoStatusOnlySchema,
} from '@/schemas/todos.schema';
import type { Result } from '@/types/response';
import type { Prisma, Todo } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export async function getTodos(
  input: GetTodosInputSchema
): Promise<Result<Todo[], GetTodosInputSchema>> {
  const session = await auth();
  if (!session?.user.id) {
    return {
      success: false,
      error: 'Unauthorized',
    };
  }
  const userId = session.user.id;

  try {
    const validationResult = getTodosInputSchema.safeParse(input);

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.flatten(),
      };
    }

    const { date, start, end, status, priority, category, query, limit } =
      validationResult.data;

    const where: Prisma.TodoWhereInput = {
      userId,
      AND: [
        {
          OR: [
            {
              date: date
                ? new Date(Date.UTC(date.year, date.monthIndex, date.date))
                : {
                    gte: new Date(
                      start.getUTCFullYear(),
                      start.getUTCMonth(),
                      start.getUTCDate()
                    ),
                    lte: new Date(
                      end.getUTCFullYear(),
                      end.getUTCMonth(),
                      end.getUTCDate()
                    ),
                  },
            },
            {
              dueTime: {
                gte: start,
                lte: end,
              },
            },
          ],
        },
        ...(status ? [{ status }] : []),
        ...(priority ? [{ priority }] : []),
        ...(category ? [{ category }] : []),
        ...(query
          ? [
              {
                OR: [
                  {
                    title: {
                      contains: query,
                      mode: 'insensitive' as Prisma.QueryMode,
                    },
                  },
                  {
                    description: {
                      contains: query,
                      mode: 'insensitive' as Prisma.QueryMode,
                    },
                  },
                ] as Prisma.TodoWhereInput[],
              },
            ]
          : []),
      ],
    };

    const todos = await prisma.todo.findMany({
      where,
      ...(limit ? { take: limit } : {}),
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: todos,
    };
  } catch (error) {
    console.error('Error fetching todos:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during fetching todos.',
    };
  }
}

export async function createTodo(
  input: CreateTodoInputSchema
): Promise<Result<Todo, CreateTodoInputSchema>> {
  const session = await auth();
  if (!session?.user.id) {
    return {
      success: false,
      error: 'Unauthorized',
    };
  }
  const userId = session.user.id;

  try {
    const validationResult = createTodoInputSchema.safeParse(input);

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.flatten(),
      };
    }

    const { date, ...rest } = validationResult.data;

    const payload: Prisma.TodoCreateArgs['data'] = {
      userId,
      ...rest,
    };

    if (date) {
      payload.date = new Date(Date.UTC(date.year, date.monthIndex, date.date));
    }

    const newTodo = await prisma.todo.create({
      data: payload,
    });

    return {
      success: true,
      data: newTodo,
    };
  } catch (error) {
    console.error('Error creating todo:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during creating todo.',
    };
  }
}

async function getTodoAndCheckOwnership(
  id: string,
  userId: string
): Promise<
  | {
      error: string;
      isOwner: false;
    }
  | { isOwner: true }
> {
  const todo = await prisma.todo.findUnique({
    where: { id },
    select: {
      userId: true,
    },
  });

  if (!todo) {
    return { error: 'Todo not found', isOwner: false };
  }

  if (todo.userId !== userId) {
    return { error: 'Forbidden', isOwner: false };
  }
  return { isOwner: true };
}

export async function deleteTodo(
  input: DeleteTodoInputSchema
): Promise<Result<undefined, DeleteTodoInputSchema>> {
  const session = await auth();
  if (!session?.user.id) {
    return {
      success: false,
      error: 'Unauthorized',
    };
  }
  const userId = session.user.id;

  const validationResult = deleteTodoInputSchema.safeParse(input);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.flatten(),
    };
  }

  const { todoId } = validationResult.data;

  try {
    const ownership = await getTodoAndCheckOwnership(todoId, userId);
    if (!ownership.isOwner) {
      return {
        success: false,
        error: ownership.error || 'Operation not allowed.',
      };
    }

    await prisma.todo.delete({
      where: { id: todoId },
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
        error: 'Todo not found for deletion.',
      };
    }
    console.error(`Error deleting todo ${todoId}:`, error);
    return {
      success: false,
      error: `An unexpected error occurred while deleting todo ${todoId}`,
    };
  }
}

export async function updateTodoStatus(
  input: UpdateTodoStatusOnlyInput
): Promise<Result<undefined, UpdateTodoStatusOnlyInput>> {
  const session = await auth();
  if (!session?.user.id) {
    return {
      success: false,
      error: 'Unauthorized',
    };
  }
  const userId = session.user.id;

  const validationResult = updateTodoStatusOnlySchema.safeParse(input);
  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.flatten(),
    };
  }

  const { todoId, status } = validationResult.data;

  try {
    const ownership = await getTodoAndCheckOwnership(todoId, userId);
    if (!ownership.isOwner) {
      return {
        success: false,
        error: ownership.error || 'Operation not allowed.',
      };
    }

    await prisma.todo.update({
      where: { id: todoId },
      data: { status },
      select: {
        id: true,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error updating todo status:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during updating todo status.',
    };
  }
}
