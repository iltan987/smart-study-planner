'use server';

import { RESPONSE_MESSAGES } from '@/constants/response-messages';
import prisma from '@/lib/db';
import {
  functionCallContentSchema,
  type FunctionCallContentSchema,
  functionResponseContentSchema,
  type FunctionResponseContentSchema,
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
          ...parsedMessage.data,
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
  message: Omit<FunctionCallContentSchema, 'type'>
) => Promise<Response<FunctionCallContentSchema, string>>;

export const saveFunctionCallMessage: SaveFunctionCallMessageFunction = async (
  message
) =>
  await withAuth(async (session) => {
    if (!session) {
      return { success: false, error: RESPONSE_MESSAGES.UNAUTHORIZED };
    }
    const parsedMessage = functionCallContentSchema.safeParse(message);

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
          ...parsedMessage.data,
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

      const [historyEntry] = await Promise.all([
        prisma.history.create({
          data: {
            user: {
              connect: {
                id: session.user.id,
              },
            },
            ...parsedMessage.data,
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
