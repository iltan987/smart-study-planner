'use server';

import { RESPONSE_MESSAGES_SUCCESS } from '@/constants/response-messages';
import prisma from '@/lib/db';
import { messageSchema, type MessageSchema } from '@/schemas/message.schema';
import type { Response } from '@/types/response.type';

type SaveMessageFunction = (
  userId: string,
  message: MessageSchema
) => Promise<Response<MessageSchema, string>>;

export const saveMessage: SaveMessageFunction = async (userId, message) => {
  const parsedMessage = messageSchema.safeParse(message);
  if (!parsedMessage.success) {
    return {
      success: false,
      error: parsedMessage.error.flatten(),
    };
  }

  const { id: messageId } = await prisma.history.create({
    data: {
      userId,
      content: parsedMessage.data.content,
      owner: parsedMessage.data.owner,
      time: parsedMessage.data.time,
    },
    select: {
      id: true,
    },
  });

  return {
    success: true,
    message: RESPONSE_MESSAGES_SUCCESS.MESSAGE_SUCCESS,
    data: messageId,
  };
};

type GetUserChatHistoryFunction = (userId: string) => Promise<MessageSchema[]>;

export const getUserChatHistory: GetUserChatHistoryFunction = async (
  userId
) => {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const history = await prisma.history.findMany({
    where: { userId, time: { gt: oneDayAgo } },
  });

  const messages: MessageSchema[] = history.map((msg) => ({
    content: msg.content,
    owner: msg.owner,
    time: msg.time,
  }));

  return messages.sort((a, b) => a.time.getTime() - b.time.getTime());
};

export const deleteUserChatHistory = async (userId: string) => {
  await prisma.history.deleteMany({
    where: { userId },
  });

  return {
    success: true,
    message: RESPONSE_MESSAGES_SUCCESS.MESSAGE_SUCCESS,
  };
};

export const deleteMessage = async (userId: string, messageId: string) => {
  await prisma.history.delete({
    where: { id: messageId, userId },
  });

  return {
    success: true,
    message: RESPONSE_MESSAGES_SUCCESS.MESSAGE_SUCCESS,
  };
};
