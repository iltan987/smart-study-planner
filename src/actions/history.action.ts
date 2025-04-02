'use server';

import { RESPONSE_MESSAGES } from '@/constants/response-messages';
import prisma from '@/lib/db';
import {
  createFunctionCallContentSchema,
  type CreateFunctionCallContentSchema,
  createFunctionResponseContentSchema,
  type CreateFunctionResponseContentSchema,
  type HistorySchema,
  historySchema,
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

    const historyEntries: HistorySchema[] = [];

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

    return {
      success: true,
      data: historySchema
        .array()
        .parse(
          historyEntries.sort((a, b) => a.time.getTime() - b.time.getTime())
        ),
      message: RESPONSE_MESSAGES.MESSAGES_RETRIEVED_SUCCESS,
    };
  });

type GetTextHistoryFunction = () => Promise<
  Response<undefined, TextContentSchema[]>
>;

export const getTextHistory: GetTextHistoryFunction = async () =>
  await withAuth(async (session) => {
    if (!session) {
      return { success: false, error: RESPONSE_MESSAGES.UNAUTHORIZED };
    }

    const historyEntries = await getRedisTextHistory(session.user.id);

    return {
      success: true,
      data: historyEntries.sort((a, b) => a.time.getTime() - b.time.getTime()),
      message: RESPONSE_MESSAGES.MESSAGES_RETRIEVED_SUCCESS,
    };
  });

type SaveTextMessageFunction = (
  message: Omit<TextContentSchema, 'type'>
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

    const [historyEntry] = await Promise.all([
      prisma.history.create({
        data: {
          user: {
            connect: {
              id: session.user.id,
            },
          },
          textContent: {
            create: {
              text: parsedMessage.data.text,
              role: parsedMessage.data.role,
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
  message: CreateFunctionCallContentSchema
) => Promise<Response<CreateFunctionCallContentSchema, string>>;

export const saveFunctionCallMessage: SaveFunctionCallMessageFunction = async (
  message
) =>
  await withAuth(async (session) => {
    if (!session) {
      return { success: false, error: RESPONSE_MESSAGES.UNAUTHORIZED };
    }
    const parsedMessage = createFunctionCallContentSchema.safeParse(message);

    if (!parsedMessage.success) {
      return { success: false, error: parsedMessage.error.message };
    }

    const [historyEntry] = await Promise.all([
      prisma.history.create({
        data: {
          user: {
            connect: {
              id: session.user.id,
            },
          },
          functionCallContent: {
            create: {
              name: parsedMessage.data.name,
              args: parsedMessage.data.args,
            },
          },
        },
        select: {
          id: true,
        },
      }),
      saveFunctionCallHistory(session.user.id, parsedMessage.data),
    ]);

    return {
      success: true,
      data: historyEntry.id,
      message: RESPONSE_MESSAGES.MESSAGE_SAVED_SUCCESS,
    };
  });

type SaveFunctionResponseMessageFunction = (
  message: CreateFunctionResponseContentSchema
) => Promise<Response<CreateFunctionResponseContentSchema, string>>;

export const saveFunctionResponseMessage: SaveFunctionResponseMessageFunction =
  async (message) =>
    await withAuth(async (session) => {
      if (!session) {
        return { success: false, error: RESPONSE_MESSAGES.UNAUTHORIZED };
      }
      const parsedMessage =
        createFunctionResponseContentSchema.safeParse(message);

      if (!parsedMessage.success) {
        return { success: false, error: parsedMessage.error.message };
      }

      const [historyEntry] = await Promise.all([
        prisma.history.create({
          data: {
            user: {
              connect: {
                id: session.user.id,
              },
            },
            functionResponseContent: {
              create: {
                name: parsedMessage.data.name,
                response: parsedMessage.data.response,
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
