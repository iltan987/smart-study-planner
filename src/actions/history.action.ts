'use server';

import { RESPONSE_MESSAGES } from '@/constants/response-messages';
import prisma from '@/lib/db';
import {
  functionCallContentSchema,
  type FunctionCallContentSchema,
  functionResponseContentSchema,
  type FunctionResponseContentSchema,
  historyGetSchema,
  type HistoryGetSchema,
  type HistorySchema,
  textContentGetSchema,
  type TextContentGetSchema,
  textContentSchema,
  type TextContentSchema,
} from '@/schemas/history.schema';
import { type Response } from '@/types/response.type';
import {
  getFunctionCallHistory,
  getFunctionResponseHistory,
  getTextHistory as getRedisTextHistory,
  saveFunctionCallHistory,
  saveFunctionResponseHistory,
  saveTextHistory,
} from '@/utils/redis.util';
import { withAuth } from '@/utils/withAuth';

type GetFullHistoryFunction = () => Promise<
  Response<undefined, HistorySchema[]>
>;

export const getFullHistory: GetFullHistoryFunction = async () =>
  await withAuth(async (session) => {
    if (!session) {
      return { success: false, error: RESPONSE_MESSAGES.UNAUTHORIZED };
    }

    const historyEntries: HistoryGetSchema[] = [];

    const [textHistory, functionCallHistory, functionResponseHistory] =
      await Promise.all([
        getRedisTextHistory(session.user.id),
        getFunctionCallHistory(session.user.id),
        getFunctionResponseHistory(session.user.id),
      ]);

    historyEntries.push(
      ...textHistory,
      ...functionCallHistory,
      ...functionResponseHistory
    );

    const sortedHistoryEntries = historyEntries.sort(
      (a, b) => a.time.getTime() - b.time.getTime()
    );

    return {
      success: true,
      data: historyGetSchema.array().parse(sortedHistoryEntries),
      message: RESPONSE_MESSAGES.MESSAGES_RETRIEVED_SUCCESS,
    };
  });

// export const getFullHistory: GetFullHistoryFunction = async () =>
//   await withAuth(async (session) => {
//     if (!session) {
//       return { success: false, error: RESPONSE_MESSAGES.UNAUTHORIZED };
//     }
//     const historyEntries = await prisma.history.findMany({
//       where: {
//         userId: session.user.id,
//       },
//       include: {
//         content: {
//           include: {
//             textContent: {
//               omit: {
//                 contentId: true,
//                 id: true,
//               },
//             },
//             functionCallContent: {
//               omit: {
//                 contentId: true,
//                 id: true,
//               },
//             },
//             functionResponseContent: {
//               omit: {
//                 contentId: true,
//                 id: true,
//               },
//             },
//           },
//           omit: {
//             id: true,
//           },
//         },
//       },
//       orderBy: { time: 'asc' },
//       omit: {
//         id: true,
//         contentId: true,
//         userId: true,
//       },
//     });
//     return {
//       success: true,
//       data: historySchema.array().parse(historyEntries),
//       message: RESPONSE_MESSAGES.MESSAGES_RETRIEVED_SUCCESS,
//     };
//   });

type GetTextHistoryFunction = () => Promise<
  Response<undefined, TextContentGetSchema[]>
>;

export const getTextHistory: GetTextHistoryFunction = async () =>
  await withAuth(async (session) => {
    if (!session) {
      return { success: false, error: RESPONSE_MESSAGES.UNAUTHORIZED };
    }

    const historyEntries: TextContentGetSchema[] = await getRedisTextHistory(
      session.user.id
    );

    const sortedHistoryEntries = historyEntries.sort(
      (a, b) => a.time.getTime() - b.time.getTime()
    );

    return {
      success: true,
      data: textContentGetSchema.array().parse(sortedHistoryEntries),
      message: RESPONSE_MESSAGES.MESSAGES_RETRIEVED_SUCCESS,
    };
  });

// export const getTextHistory: GetTextHistoryFunction = async () =>
//   await withAuth(async (session) => {
//     if (!session) {
//       return { success: false, error: RESPONSE_MESSAGES.UNAUTHORIZED };
//     }
//     const historyEntries = await prisma.history.findMany({
//       where: {
//         userId: session.user.id,
//         content: {
//           type: ContentType.TEXT,
//         },
//       },
//       include: {
//         content: {
//           include: {
//             textContent: {
//               omit: {
//                 contentId: true,
//                 id: true,
//               },
//             },
//           },
//           omit: {
//             id: true,
//           },
//         },
//       },
//       orderBy: { time: 'asc' },
//       omit: {
//         id: true,
//         contentId: true,
//         userId: true,
//       },
//     });
//     return {
//       success: true,
//       data: textContentOnlyHistorySchema.array().parse(historyEntries),
//       message: RESPONSE_MESSAGES.MESSAGES_RETRIEVED_SUCCESS,
//     };
//   });

type SaveTextMessageFunction = (
  message: TextContentSchema
) => Promise<Response<TextContentSchema, string>>;

export const saveTextMessage: SaveTextMessageFunction = async (message) =>
  await withAuth(async (session) => {
    if (!session) {
      return { success: false, error: RESPONSE_MESSAGES.UNAUTHORIZED };
    }
    const parsedMessage = textContentSchema.safeParse(message);

    if (!parsedMessage.success) {
      return { success: false, error: parsedMessage.error.message };
    }

    const { type, ...rest } = parsedMessage.data;

    const [historyEntry] = await Promise.all([
      prisma.history.create({
        data: {
          user: {
            connect: {
              id: session.user.id,
            },
          },
          type,
          textContent: {
            create: {
              ...rest,
            },
          },
        },
        select: {
          id: true,
        },
      }),
      saveTextHistory(session.user.id, parsedMessage.data),
    ]);

    return {
      success: true,
      data: historyEntry.id,
      message: RESPONSE_MESSAGES.MESSAGE_SAVED_SUCCESS,
    };
  });

type SaveFunctionCallMessageFunction = (
  message: FunctionCallContentSchema,
  context: {
    userId?: string;
    userDateTime?: Date;
    userTimeZone?: string;
  }
) => Promise<Response<FunctionCallContentSchema, string>>;

export const saveFunctionCallMessage: SaveFunctionCallMessageFunction = async (
  message,
  context
) =>
  await withAuth(async (session) => {
    if (!session) {
      return { success: false, error: RESPONSE_MESSAGES.UNAUTHORIZED };
    }
    const parsedMessage = functionCallContentSchema.safeParse(message);

    if (!parsedMessage.success) {
      return { success: false, error: parsedMessage.error.message };
    }

    const { type, ...rest } = parsedMessage.data;

    const [historyEntry] = await Promise.all([
      prisma.history.create({
        data: {
          user: {
            connect: {
              id: session.user.id,
            },
          },
          type,
          functionCallContent: {
            create: {
              ...rest,
              context,
            },
          },
        },
        select: {
          id: true,
        },
      }),
      saveFunctionCallHistory(session.user.id, parsedMessage.data, context),
    ]);

    return {
      success: true,
      data: historyEntry.id,
      message: RESPONSE_MESSAGES.MESSAGE_SAVED_SUCCESS,
    };
  });

type SaveFunctionResponseMessageFunction = (
  message: FunctionResponseContentSchema
) => Promise<Response<FunctionResponseContentSchema, string>>;

export const saveFunctionResponseMessage: SaveFunctionResponseMessageFunction =
  async (message) =>
    await withAuth(async (session) => {
      if (!session) {
        return { success: false, error: RESPONSE_MESSAGES.UNAUTHORIZED };
      }
      const parsedMessage = functionResponseContentSchema.safeParse(message);

      if (!parsedMessage.success) {
        return { success: false, error: parsedMessage.error.message };
      }

      const { type, ...rest } = parsedMessage.data;

      const [historyEntry] = await Promise.all([
        prisma.history.create({
          data: {
            user: {
              connect: {
                id: session.user.id,
              },
            },
            type,
            functionResponseContent: {
              create: {
                ...rest,
              },
            },
          },
          select: {
            id: true,
          },
        }),
        saveFunctionResponseHistory(session.user.id, parsedMessage.data),
      ]);

      return {
        success: true,
        data: historyEntry.id,
        message: RESPONSE_MESSAGES.MESSAGE_SAVED_SUCCESS,
      };
    });
