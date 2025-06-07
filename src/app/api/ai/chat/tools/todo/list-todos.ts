import { getTodos as serverActionGetTodos } from '@/actions/todos.action';
import type { ListTodosToolInput } from '@/schemas/ai-tools.schema';
import { listTodosParamsSchema } from '@/schemas/ai-tools.schema';
import type { GetTodosInputSchema as PrismaGetTodosInput } from '@/schemas/todos.schema';
import { endOfDay, format, parseISO, startOfDay } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

export const toolListTodos = {
  description:
    "Use this tool to retrieve a list of the user's to-do items for a SINGLE, SPECIFIC date. To get todos for a range (e.g., 'this week'), you must call this tool multiple times, once for each day in the range.",
  parameters: listTodosParamsSchema,
  execute: async ({
    userId,
    userTimezone,
    args,
  }: {
    userId: string;
    userTimezone: string;
    args: ListTodosToolInput;
  }): Promise<string> => {
    console.log(
      `TOOL CALL: get_todos for user ${userId} with args:`,
      JSON.stringify(args, null, 2)
    );
    const { date } = args;

    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return 'Error: The date must be in the format YYYY-MM-DD.';
    }

    const parsedDate = parseISO(date);
    if (isNaN(parsedDate.getTime())) {
      return 'Error: The provided date is invalid.';
    }

    const start = fromZonedTime(startOfDay(parsedDate), userTimezone);
    const end = fromZonedTime(endOfDay(parsedDate), userTimezone);

    const prismaGetTodosInput: PrismaGetTodosInput = {
      date: {
        year: parsedDate.getFullYear(),
        monthIndex: parsedDate.getMonth(),
        date: parsedDate.getDate(),
      },
      start: start,
      end: end,
    };

    const result = await serverActionGetTodos(prismaGetTodosInput);

    if (result.success) {
      if (result.data) {
        if (result.data.length === 0) {
          return 'No todos found matching your criteria.';
        }
        const todosString = result.data
          .map((todo) => {
            let dueString = ' (all day)';
            if (todo.dueTime)
              dueString = `at ${formatInTimeZone(todo.dueTime, userTimezone, 'p')}`;
            return `- "${todo.title}" (Status: ${todo.status}, Priority: ${todo.priority}, Category: ${todo.category} ${dueString})`;
          })
          .join('\n');
        return `Here are your todos for ${format(parsedDate, 'PPP')}:\n${todosString}`;
      }
      return 'No todos found.';
    } else {
      const errorMsg =
        typeof result.error === 'string'
          ? result.error
          : JSON.stringify(result.error);
      console.error('Error from serverActionGetTodos:', errorMsg);
      return `Sorry, I couldn't retrieve the todos. There was an issue: ${errorMsg}`;
    }
  },
};
