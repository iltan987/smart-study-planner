import { createTodo as serverActionCreateTodo } from '@/actions/todos.action';
import type { CreateTodoToolInput } from '@/schemas/ai-tools.schema';
import { createTodoParamsSchema } from '@/schemas/ai-tools.schema';
import type { CreateTodoInputSchema as PrismaCreateTodoInput } from '@/schemas/todos.schema';
import type { Todo } from '@prisma/client';
import { parseISO } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

interface CreateTodoToolResult {
  success: boolean;
  todo?: Pick<
    Todo,
    | 'category'
    | 'date'
    | 'description'
    | 'dueTime'
    | 'duration'
    | 'priority'
    | 'status'
    | 'title'
  >;
  error?: string;
}

export const toolCreateTodo = {
  description:
    'Use this tool to create a new task, reminder, or to-do item for the user. It is suitable for tasks that have a deadline or need to be done on a specific day.',
  parameters: createTodoParamsSchema,
  execute: async ({
    userId,
    args,
    userTimezone,
  }: {
    userId: string;
    args: CreateTodoToolInput;
    userTimezone: string;
  }): Promise<CreateTodoToolResult> => {
    console.log(
      `TOOL CALL: create_todo for user ${userId} with args:`,
      JSON.stringify(args, null, 2)
    );
    const {
      title,
      description,
      date: dateString,
      dueTime: dueTimeString,
      duration,
      priority,
      category,
      status,
    } = args;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return {
        success: false,
        error: 'Error: The date must be in the format YYYY-MM-DD.',
      };
    }

    if (dueTimeString && !/^\d{2}:\d{2}$/.test(dueTimeString)) {
      return {
        success: false,
        error:
          'Error: The due time must be in the format HH:mm (24-hour format).',
      };
    }

    const parsedDate = parseISO(dateString);
    if (isNaN(parsedDate.getTime())) {
      return {
        success: false,
        error: 'Error: The provided date is invalid.',
      };
    }

    const finalDueTime =
      dueTimeString &&
      fromZonedTime(
        parseISO(`${dateString}T${dueTimeString}:00`),
        userTimezone
      );

    const prismaTodoInput: PrismaCreateTodoInput = {
      title,
      ...(description && { description }),
      ...(duration && { duration }),
      ...(priority && { priority }),
      ...(category && { category }),
      ...(status && { status }),
      ...(dueTimeString
        ? finalDueTime && { dueTime: finalDueTime }
        : {
            date: {
              year: parsedDate.getFullYear(),
              monthIndex: parsedDate.getMonth(),
              date: parsedDate.getDate(),
            },
          }),
    };

    const result = await serverActionCreateTodo(prismaTodoInput);
    if (result.success) {
      if (!result.data) {
        console.error('No data returned from serverActionCreateTodo');
        return {
          success: false,
          error:
            'Error: Todo created successfully, but no data was returned from the server.',
        };
      }
      const {
        category,
        date,
        description,
        dueTime,
        duration,
        priority,
        status,
        title,
      } = result.data;
      return {
        success: true,
        todo: {
          category,
          date,
          description,
          dueTime,
          duration,
          priority,
          status,
          title,
        },
      };
    } else {
      const errorMsg =
        typeof result.error === 'string'
          ? result.error
          : JSON.stringify(result.error);
      console.error('Error from serverActionCreateTodo:', errorMsg);
      return {
        success: false,
        error: `Sorry, I couldn't create the todo. ${errorMsg.includes('required') ? 'Some required information might be missing.' : 'There was an issue.'}`,
      };
    }
  },
};
