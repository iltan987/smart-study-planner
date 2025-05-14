import type { Status } from '@/generated/prisma-client';
import { updateMemorySchema } from '@/schemas/memory.schema';
import type { DateTimeModificationSchema } from '@/schemas/todo.schema';
import {
  createTodoSchema,
  dateTimeModification,
  getTodosInputSchema,
} from '@/schemas/todo.schema';
import { processDateWithTimezone } from '@/utils/date-time.util';
import type { FunctionCall } from '@google/generative-ai';
import {
  createTodo as createTodoServer,
  getTodos as getTodosServer,
  markAs as markAsServer,
} from '../../actions/todo.action';
import { createMemory } from '../../utils/memory.util';

type AIFunctionImplementationSignature = (
  funcCall: FunctionCall,
  context: {
    userId?: string;
    userDateTime?: Date;
    userTimeZone?: string;
  }
) => Promise<unknown>;

export const saveUserInfo: AIFunctionImplementationSignature = async (
  funcCall,
  { userId }
) => {
  if (userId) {
    const parsedArgs = updateMemorySchema.safeParse(funcCall.args);
    if (parsedArgs.success) {
      await createMemory(userId, parsedArgs.data);
    }

    return {
      status: 'success',
    };
  }
  return {
    status: 'error',
    message: 'Server error',
  };
};

export const createTodo: AIFunctionImplementationSignature = async (
  funcCall,
  { userId, userDateTime, userTimeZone }
) => {
  if (userId && userDateTime && userTimeZone) {
    const { dueTime } = funcCall.args as {
      dueTime: DateTimeModificationSchema;
    };
    const parsedDateTimeModification = dateTimeModification.safeParse(dueTime);
    if (!parsedDateTimeModification.success) {
      return {
        status: 'error',
        message: 'Failed to parse dueTime',
      };
    }

    const processedDate = processDateWithTimezone(
      userDateTime,
      userTimeZone,
      parsedDateTimeModification.data
    );

    if (!processedDate.success) {
      return {
        status: 'error',
        message: processedDate.message,
      };
    }

    const parsedArgs = createTodoSchema.safeParse({
      ...funcCall.args,
      dueTime: processedDate.data,
    });
    if (parsedArgs.success) {
      const todo = await createTodoServer(userId, parsedArgs.data);
      if (todo.success) {
        return {
          status: 'success',
          data: {
            todoId: todo.data,
          },
        };
      } else if (typeof todo.error === 'string') {
        return {
          status: 'error',
          message: todo.error,
        };
      }
    }
  }
  return {
    status: 'error',
    message: 'Server error',
  };
};

export const markTodoAs: AIFunctionImplementationSignature = async (
  funcCall,
  { userId }
) => {
  if (userId) {
    const { todoId, status } = funcCall.args as {
      todoId: string;
      status: Status;
    };
    if (!todoId || !status) {
      return {
        status: 'error',
        message: 'todoId and status are required',
      };
    }
    const todo = await markAsServer(userId, todoId, status);
    if (todo.success) {
      return {
        status: 'success',
      };
    } else if (typeof todo.error === 'string') {
      return {
        status: 'error',
        message: todo.error,
      };
    }
  }
  return {
    status: 'error',
    message: 'Server error',
  };
};

export const getTodos: AIFunctionImplementationSignature = async (
  funcCall,
  { userId }
) => {
  if (userId) {
    const parsedArgs = getTodosInputSchema.safeParse(funcCall.args);
    if (parsedArgs.success) {
      const todos = await getTodosServer(
        userId,
        parsedArgs.data.start,
        parsedArgs.data.end
      );
      if (todos.success) {
        return {
          status: 'success',
          todos: todos.data,
        };
      } else if (typeof todos.error === 'string') {
        return {
          status: 'error',
          message: todos.error,
        };
      }
    }
  }
  return {
    status: 'error',
    message: 'Server error',
  };
};
