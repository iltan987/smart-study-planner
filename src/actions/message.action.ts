'use server';

import { RESPONSE_MESSAGES_SUCCESS } from '@/constants/response-messages';
import redis from '@/lib/redis';
import { messageSchema, type MessageSchema } from '@/schemas/message.schema';
import type { Response } from '@/types/response';
import { v4 as uuidv4 } from 'uuid';

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

  let messageId = uuidv4();

  while (await redis.exists(`chat:${userId}:${messageId}`)) {
    messageId = uuidv4();
  }

  const key = `chat:${userId}:${messageId}`;

  await redis.hSet(key, {
    ...message,
  });

  await redis.expire(key, 60 * 60 * 24);

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
  const keys = await redis.keys(`chat:${userId}:*`);

  const messages: MessageSchema[] = [];
  for (const key of keys) {
    const message = await redis.hGetAll(key);
    const parsedMessage = messageSchema.safeParse(message);
    if (!parsedMessage.success) {
      continue;
    }

    messages.push(parsedMessage.data);
  }

  if (messages.length === 0) {
    return [];
  }

  return messages.sort((a, b) => a.timestamp - b.timestamp);
};
