import { Category, Priority, Status } from '@/generated/prisma-client';
import { SchemaType, type FunctionDeclaration } from '@google/generative-ai';
import {
  createTodo,
  getTodos,
  markTodoAs,
  saveUserInfo,
} from './function-implementations';

export const functionDeclarations: FunctionDeclaration[] | undefined = [
  {
    name: saveUserInfo.name,
    description: 'Saves important information about the user to the database',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        content: {
          type: SchemaType.STRING,
          description: 'The valuable information provided by the user',
        },
      },
      required: ['content'],
    },
  },
  {
    name: createTodo.name,
    description: 'Creates a new todo item for the user',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: {
          type: SchemaType.STRING,
          description: 'The title of the todo item',
        },
        description: {
          type: SchemaType.STRING,
          description: 'The description of the todo item',
        },
        priority: {
          type: SchemaType.STRING,
          format: 'enum',
          enum: Object.values(Priority),
          description: 'The priority of the todo item. Default is "medium"',
        },
        category: {
          type: SchemaType.STRING,
          format: 'enum',
          enum: Object.values(Category),
          description: 'The category of the todo item. Default is "study"',
        },
        dueTime: {
          type: SchemaType.OBJECT,
          description:
            "The due time of the todo item, extracted from user's expression. Use add/set structure as appropriate.",
          properties: {
            duration_to_add: {
              type: SchemaType.OBJECT,
              description:
                "Relative time to add to the user's current date/time (e.g., { hours: 2, days: 1 })",
              properties: {
                years: {
                  type: SchemaType.INTEGER,
                  description: 'Years to add',
                },
                months: {
                  type: SchemaType.INTEGER,
                  description: 'Months to add',
                },
                weeks: {
                  type: SchemaType.INTEGER,
                  description: 'Weeks to add',
                },
                days: { type: SchemaType.INTEGER, description: 'Days to add' },
                hours: {
                  type: SchemaType.INTEGER,
                  description: 'Hours to add',
                },
                minutes: {
                  type: SchemaType.INTEGER,
                  description: 'Minutes to add',
                },
                seconds: {
                  type: SchemaType.INTEGER,
                  description: 'Seconds to add',
                },
              },
            },
            duration_to_set: {
              type: SchemaType.OBJECT,
              description:
                'Absolute time to set (e.g., { hours: 15, minutes: 0 })',
              properties: {
                year: { type: SchemaType.INTEGER, description: 'Year to set' },
                month: {
                  type: SchemaType.INTEGER,
                  description: 'Month to set',
                },
                date: {
                  type: SchemaType.INTEGER,
                  description: 'Day of month to set',
                },
                hours: { type: SchemaType.INTEGER, description: 'Hour to set' },
                minutes: {
                  type: SchemaType.INTEGER,
                  description: 'Minute to set',
                },
                seconds: {
                  type: SchemaType.INTEGER,
                  description: 'Second to set',
                },
              },
            },
          },
        },
        duration: {
          type: SchemaType.NUMBER,
          description: 'The duration in hours for which the todo item is valid',
        },
        status: {
          type: SchemaType.STRING,
          format: 'enum',
          enum: Object.values(Status),
          description: 'The status of the todo item. Default is "pending"',
        },
      },
      required: ['title'],
    },
  },
  {
    name: markTodoAs.name,
    description: 'Marks a todo item as completed, pending, or missed',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        todoId: {
          type: SchemaType.STRING,
          description: 'The ID of the todo item to be updated',
        },
        status: {
          type: SchemaType.STRING,
          format: 'enum',
          enum: Object.values(Status),
          description: 'The status of the todo item',
        },
      },
      required: ['status', 'todoId'],
    },
  },
  {
    name: getTodos.name,
    description:
      'Retrieves all todos (including their id) for the user within a specified date range',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        start: {
          type: SchemaType.STRING,
          format: 'date-time',
          description: 'The start date for the todos',
        },
        end: {
          type: SchemaType.STRING,
          format: 'date-time',
          description: 'The end date for the todos',
        },
      },
      required: ['start', 'end'],
    },
  },
];
