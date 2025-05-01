import { updateMemorySchema } from '@/schemas/memory.schema';
import {
  createTodoSchema,
  getTodosInputSchema,
  markAsTodoSchema,
} from '@/schemas/todo.schema';
import type { FunctionCall } from '@google/generative-ai';
import {
  createTodo as createTodoServer,
  getTodos as getTodosServer,
  markAs as markAsServer,
} from '../../actions/todo.action';
import { createMemory } from '../../utils/memory.util';

export const saveUserInfo = async (funcCall: FunctionCall, userId: string) => {
  const parsedArgs = updateMemorySchema.safeParse(funcCall.args);
  if (parsedArgs.success) {
    await createMemory(userId, parsedArgs.data);

    return {
      name: saveUserInfo.name,
      response: {
        status: 'success',
      },
    };
  }
  return {
    name: saveUserInfo.name,
    response: {
      status: 'error',
    },
  };
};

export const createTodo = async (funcCall: FunctionCall, userId: string) => {
  const parsedArgs = createTodoSchema.safeParse(funcCall.args);
  if (parsedArgs.success) {
    const todo = await createTodoServer(userId, parsedArgs.data);
    if (todo.success) {
      return {
        name: createTodo.name,
        response: {
          status: 'success',
          todoId: todo.data,
        },
      };
    } else if (typeof todo.error === 'string') {
      return {
        name: createTodo.name,
        response: {
          status: 'error',
          message: todo.error,
        },
      };
    }
  }
  return {
    name: createTodo.name,
    response: {
      status: 'error',
    },
  };
};

export const markTodoAs = async (funcCall: FunctionCall, userId: string) => {
  const parsedArgs = markAsTodoSchema.safeParse(funcCall.args);
  if (parsedArgs.success) {
    const todo = await markAsServer(userId, parsedArgs.data);
    if (todo.success) {
      return {
        name: markTodoAs.name,
        response: {
          status: 'success',
        },
      };
    } else if (typeof todo.error === 'string') {
      return {
        name: markTodoAs.name,
        response: {
          status: 'error',
          message: todo.error,
        },
      };
    }
  }
  return {
    name: markTodoAs.name,
    response: {
      status: 'error',
    },
  };
};

export const getTodos = async (funcCall: FunctionCall, userId: string) => {
  const parsedArgs = getTodosInputSchema.safeParse(funcCall.args);
  if (parsedArgs.success) {
    const todos = await getTodosServer(
      userId,
      parsedArgs.data.start,
      parsedArgs.data.end
    );
    if (todos.success) {
      return {
        name: getTodos.name,
        response: {
          status: 'success',
          todos: todos.data,
        },
      };
    } else if (typeof todos.error === 'string') {
      return {
        name: getTodos.name,
        response: {
          status: 'error',
          message: todos.error,
        },
      };
    }
  }
  return {
    name: getTodos.name,
    response: {
      status: 'error',
    },
  };
};
