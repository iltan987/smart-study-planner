import { createTodo as serverActionCreateTodo } from '@/actions/todos.action';
import {
  createTodoToolSchema,
  type CreateTodoToolInput,
} from '@/schemas/ai-tools.schema';
import type { CreateTodoInputSchema as PrismaCreateTodoInput } from '@/schemas/todos.schema';
import {
  processAiDateTimeInput,
  type ProcessedAiDate,
} from '@/utils/date.util';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export const toolCreateTodo = {
  description: 'Creates a new todo item for the user in their planner.',
  parameters: createTodoToolSchema,
  execute: async ({
    userId,
    userTimezone,
    currentServerDate,
    args,
  }: {
    userId: string;
    userTimezone: string;
    currentServerDate: Date;
    args: CreateTodoToolInput;
  }): Promise<string> => {
    console.log(
      `TOOL CALL: create_todo for user ${userId} with args:`,
      JSON.stringify(args, null, 2)
    );
    const {
      title,
      description,
      dateTime,
      duration,
      priority,
      category,
      status,
    } = args;

    let processedDateInfo: ProcessedAiDate | null = null;
    if (dateTime) {
      processedDateInfo = processAiDateTimeInput(
        dateTime,
        userTimezone,
        currentServerDate
      );
      if (!processedDateInfo)
        return `Error: Could not understand the provided date/time for the todo. Please try a clearer format. Input was: ${JSON.stringify(dateTime)}`;
    }

    const prismaTodoInput: PrismaCreateTodoInput = {
      title,
      ...(description && { description }),
      ...(duration && { duration }),
      ...(priority && { priority }),
      ...(category && { category }),
      ...(status && { status }),
      ...(processedDateInfo &&
        processedDateInfo.isAllDay && {
          date: {
            year: processedDateInfo.userLocalTime.getFullYear(),
            monthIndex: processedDateInfo.userLocalTime.getMonth(),
            date: processedDateInfo.userLocalTime.getDate(),
          },
        }),
      ...(processedDateInfo &&
        !processedDateInfo.isAllDay && {
          dueTime: processedDateInfo.finalDateUTC,
        }),
    };

    if (dateTime && !prismaTodoInput.date && !prismaTodoInput.dueTime)
      return 'Error: A date or specific time is required if a date/time context was provided.';

    const result = await serverActionCreateTodo(prismaTodoInput);
    if (result.success) {
      if (!result.data) {
        console.error('No data returned from serverActionCreateTodo');
        return 'Error: Todo created successfully, but no data was returned from the server.';
      }
      let confirmationDateString = '';
      if (result.data.date)
        confirmationDateString = `for ${format(new Date(result.data.date.getFullYear(), result.data.date.getMonth(), result.data.date.getDate()), 'PPP')}`; // Reconstruct Date from YMD for formatting
      else if (result.data.dueTime)
        confirmationDateString = `due ${formatInTimeZone(result.data.dueTime, userTimezone, 'PPP p')}`;
      return `Todo "${result.data.title}" created successfully ${confirmationDateString}. ID: ${result.data.id}.`;
    } else {
      const errorMsg =
        typeof result.error === 'string'
          ? result.error
          : JSON.stringify(result.error);
      console.error('Error from serverActionCreateTodo:', errorMsg);
      return `Sorry, I couldn't create the todo. ${errorMsg.includes('required') ? 'Some required information might be missing.' : 'There was an issue.'}`;
    }
  },
};
