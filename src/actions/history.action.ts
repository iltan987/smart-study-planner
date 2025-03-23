'use server';

import { RESPONSE_MESSAGES } from '@/constants/response-messages';
import prisma from '@/lib/db';
import {
  type FunctionCallContentOnlyHistorySchema,
  type FunctionResponseContentOnlyHistorySchema,
  type HistorySchema,
  type TextContentOnlyHistorySchema,
  functionCallContentOnlyHistorySchema,
  functionResponseContentOnlyHistorySchema,
  historySchema,
  textContentOnlyHistorySchema,
} from '@/schemas/history.schema';
import { type Response } from '@/types/response.type';
import { withAuth } from '@/utils/withAuth';
import { ContentType } from '@prisma/client';

type GetFullHistoryFunction = () => Promise<
  Response<undefined, HistorySchema[]>
>;

export const getFullHistory: GetFullHistoryFunction = async () =>
  await withAuth(async (session) => {
    if (!session) {
      return { success: false, error: RESPONSE_MESSAGES.UNAUTHORIZED };
    }
    const historyEntries = await prisma.history.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        content: {
          include: {
            textContent: {
              omit: {
                contentId: true,
                id: true,
              },
            },
            functionCallContent: {
              omit: {
                contentId: true,
                id: true,
              },
            },
            functionResponseContent: {
              omit: {
                contentId: true,
                id: true,
              },
            },
          },
          omit: {
            id: true,
          },
        },
      },
      orderBy: { time: 'asc' },
      omit: {
        id: true,
        contentId: true,
        userId: true,
      },
    });
    return {
      success: true,
      data: historySchema.array().parse(historyEntries),
      message: RESPONSE_MESSAGES.MESSAGES_RETRIEVED_SUCCESS,
    };
  });

type GetTextHistoryFunction = () => Promise<
  Response<undefined, TextContentOnlyHistorySchema[]>
>;

export const getTextHistory: GetTextHistoryFunction = async () =>
  await withAuth(async (session) => {
    if (!session) {
      return { success: false, error: RESPONSE_MESSAGES.UNAUTHORIZED };
    }
    const historyEntries = await prisma.history.findMany({
      where: {
        userId: session.user.id,
        content: {
          type: ContentType.TEXT,
        },
      },
      include: {
        content: {
          include: {
            textContent: {
              omit: {
                contentId: true,
                id: true,
              },
            },
          },
          omit: {
            id: true,
          },
        },
      },
      orderBy: { time: 'asc' },
      omit: {
        id: true,
        contentId: true,
        userId: true,
      },
    });
    return {
      success: true,
      data: textContentOnlyHistorySchema.array().parse(historyEntries),
      message: RESPONSE_MESSAGES.MESSAGES_RETRIEVED_SUCCESS,
    };
  });

type SaveTextMessageFunction = (
  message: TextContentOnlyHistorySchema
) => Promise<Response<TextContentOnlyHistorySchema, string>>;

export const saveTextMessage: SaveTextMessageFunction = async (message) =>
  await withAuth(async (session) => {
    if (!session) {
      return { success: false, error: RESPONSE_MESSAGES.UNAUTHORIZED };
    }
    const parsedMessage = textContentOnlyHistorySchema.safeParse(message);

    if (!parsedMessage.success) {
      return { success: false, error: parsedMessage.error.message };
    }

    const { content, ...rest } = parsedMessage.data;

    const historyEntry = await prisma.history.create({
      data: {
        user: {
          connect: {
            id: session.user.id,
          },
        },
        ...rest,
        content: {
          create: {
            type: ContentType.TEXT,
            textContent: {
              create: content.textContent,
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    return {
      success: true,
      data: historyEntry.id,
      message: RESPONSE_MESSAGES.MESSAGE_SAVED_SUCCESS,
    };
  });

type SaveFunctionCallMessageFunction = (
  message: FunctionCallContentOnlyHistorySchema
) => Promise<Response<HistorySchema, string>>;

export const saveFunctionCallMessage: SaveFunctionCallMessageFunction = async (
  message
) =>
  await withAuth(async (session) => {
    if (!session) {
      return { success: false, error: RESPONSE_MESSAGES.UNAUTHORIZED };
    }
    const parsedMessage =
      functionCallContentOnlyHistorySchema.safeParse(message);

    if (!parsedMessage.success) {
      return { success: false, error: parsedMessage.error.message };
    }

    const { content, ...rest } = parsedMessage.data;

    const historyEntry = await prisma.history.create({
      data: {
        user: {
          connect: {
            id: session.user.id,
          },
        },
        ...rest,
        content: {
          create: {
            type: ContentType.FUNCTION_CALL,
            functionCallContent: {
              create: content.functionCallContent,
            },
          },
        },
      },
      select: {
        id: true,
      },
    });

    return {
      success: true,
      data: historyEntry.id,
      message: RESPONSE_MESSAGES.MESSAGE_SAVED_SUCCESS,
    };
  });

type SaveFunctionResponseMessageFunction = (
  message: FunctionResponseContentOnlyHistorySchema
) => Promise<Response<HistorySchema, string>>;

export const saveFunctionResponseMessage: SaveFunctionResponseMessageFunction =
  async (message) =>
    await withAuth(async (session) => {
      if (!session) {
        return { success: false, error: RESPONSE_MESSAGES.UNAUTHORIZED };
      }
      const parsedMessage =
        functionResponseContentOnlyHistorySchema.safeParse(message);

      if (!parsedMessage.success) {
        return { success: false, error: parsedMessage.error.message };
      }

      const { content, ...rest } = parsedMessage.data;

      const historyEntry = await prisma.history.create({
        data: {
          user: {
            connect: {
              id: session.user.id,
            },
          },
          ...rest,
          content: {
            create: {
              type: ContentType.FUNCTION_RESPONSE,
              functionResponseContent: {
                create: content.functionResponseContent,
              },
            },
          },
        },
        select: {
          id: true,
        },
      });

      return {
        success: true,
        data: historyEntry.id,
        message: RESPONSE_MESSAGES.MESSAGE_SAVED_SUCCESS,
      };
    });
