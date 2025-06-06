import { getTodos as serverActionGetTodos } from '@/actions/todos.action';
import {
  getTodosToolSchema,
  type GetTodosToolInput,
} from '@/schemas/ai-tools.schema';
import type { GetTodosInputSchema as PrismaGetTodosInput } from '@/schemas/todos.schema';
import { processAiDateTimeInput } from '@/utils/date.util';
import { set as dfnsSet, format } from 'date-fns';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

export const toolGetTodos = {
  description:
    'Retrieves a list of todos based on specified criteria like date, range, status, etc.',
  parameters: getTodosToolSchema,
  execute: async ({
    userId,
    userTimezone,
    currentServerDate,
    args,
  }: {
    userId: string;
    userTimezone: string;
    currentServerDate: Date;
    args: GetTodosToolInput;
  }): Promise<string> => {
    let filterDateYMD: PrismaGetTodosInput['date'] | undefined;
    let filterRangeStart: Date | undefined;
    let filterRangeEnd: Date | undefined;

    console.log(
      `TOOL CALL: get_todos for user ${userId} with args:`,
      JSON.stringify(args, null, 2)
    );
    const {
      dateTime,
      dateRangeStart,
      dateRangeEnd,
      limit,
      status,
      category,
      priority,
      query,
    } = args;
    if (dateTime) {
      const processed = processAiDateTimeInput(
        dateTime,
        userTimezone,
        currentServerDate
      );
      if (processed) {
        // For fetching, we typically want the entire day in user's local time
        const dayStartLocal = new Date(
          processed.userLocalTime.getFullYear(),
          processed.userLocalTime.getMonth(),
          processed.userLocalTime.getDate(),
          0,
          0,
          0
        );
        const dayEndLocal = new Date(
          processed.userLocalTime.getFullYear(),
          processed.userLocalTime.getMonth(),
          processed.userLocalTime.getDate(),
          23,
          59,
          59,
          999
        );

        filterDateYMD = {
          year: dayStartLocal.getFullYear(),
          monthIndex: dayStartLocal.getMonth(),
          date: dayStartLocal.getDate(),
        };
        filterRangeStart = fromZonedTime(dayStartLocal, userTimezone);
        filterRangeEnd = fromZonedTime(dayEndLocal, userTimezone);
      } else {
        return 'Error: Could not understand the date provided for filtering todos.';
      }
    } else if (dateRangeStart && dateRangeEnd) {
      const processedStart = processAiDateTimeInput(
        dateRangeStart,
        userTimezone,
        currentServerDate
      );
      const processedEnd = processAiDateTimeInput(
        dateRangeEnd,
        userTimezone,
        currentServerDate
      );
      if (processedStart && processedEnd) {
        // Assume start of day for start, end of day for end if not specified by AI time
        const startDayLocal = new Date(
          processedStart.userLocalTime.getFullYear(),
          processedStart.userLocalTime.getMonth(),
          processedStart.userLocalTime.getDate(),
          0,
          0,
          0
        );
        const endDayLocal = new Date(
          processedEnd.userLocalTime.getFullYear(),
          processedEnd.userLocalTime.getMonth(),
          processedEnd.userLocalTime.getDate(),
          23,
          59,
          59,
          999
        );

        filterRangeStart = fromZonedTime(startDayLocal, userTimezone);
        filterRangeEnd = fromZonedTime(endDayLocal, userTimezone);
        // If range is single day, also set filterDateYMD
        if (
          format(startDayLocal, 'yyyy-MM-dd') ===
          format(endDayLocal, 'yyyy-MM-dd')
        ) {
          filterDateYMD = {
            year: startDayLocal.getFullYear(),
            monthIndex: startDayLocal.getMonth(),
            date: startDayLocal.getDate(),
          };
        }
      } else {
        return 'Error: Could not understand the date range provided.';
      }
    } else {
      const refDateInUserTz = toZonedTime(currentServerDate, userTimezone);
      filterDateYMD = {
        year: refDateInUserTz.getFullYear(),
        monthIndex: refDateInUserTz.getMonth(),
        date: refDateInUserTz.getDate(),
      };

      const dayStartUserTz = dfnsSet(refDateInUserTz, {
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      });
      const dayEndUserTz = dfnsSet(refDateInUserTz, {
        hours: 23,
        minutes: 59,
        seconds: 59,
        milliseconds: 999,
      });

      filterRangeStart = fromZonedTime(dayStartUserTz, userTimezone);
      filterRangeEnd = fromZonedTime(dayEndUserTz, userTimezone);
    }

    // Construct input for Prisma action, now including status, priority, category, query
    const prismaGetTodosInput: PrismaGetTodosInput = {
      date: filterDateYMD!, // Prisma action requires date
      start: filterRangeStart!, // Prisma action requires start
      end: filterRangeEnd!, // Prisma action requires end
      ...(status && { status }),
      ...(priority && { priority }),
      ...(category && { category }),
      ...(query && { query }),
      ...(isNaN(limit) || limit <= 0 ? {} : { limit }),
      // limit is handled after fetching
    };

    const result = await serverActionGetTodos(prismaGetTodosInput);

    if (result.success) {
      if (result.data) {
        if (result.data.length === 0) {
          return 'No todos found matching your criteria.';
        }
        const todosString = result.data
          .map((todo) => {
            let dueString = '';
            if (todo.date)
              dueString = `for ${format(new Date(todo.date), 'PPP')}`;
            else if (todo.dueTime)
              dueString = `at ${formatInTimeZone(todo.dueTime, userTimezone, 'PPPp')}`;
            return `- "${todo.title}" (Status: ${todo.status}, Priority: ${todo.priority}, Category: ${todo.category} ${dueString})`;
          })
          .join('\n');
        return `Here are the todos I found${query ? ` for "${query}"` : ''}:\n${todosString}`;
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
