'use server';

import { auth } from '@/lib/auth';
import type { AssistantRating } from '@/types/assistant-rating';
import type { Result } from '@/types/response';
import {
  deleteMessageFromRedis,
  updateMessageRatingInRedis,
} from '@/utils/chat-messages.util';
import {
  createRedisChat,
  deleteRedisChat,
  getUserChatsFromRedis,
  updateRedisChatName,
} from '@/utils/chat.util';

export async function getAllChats(): Promise<
  Result<{ id: string; name: string; createdAt: Date }[]>
> {
  const session = await auth();
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }
  const chats = await getUserChatsFromRedis(session.user.id);

  return { success: true, data: chats };
}

export async function createChat(name?: string): Promise<
  Result<{
    chatId: string;
    name: string;
    createdAt: Date;
  }>
> {
  const session = await auth();
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }
  const res = await createRedisChat(session.user.id, name);

  return { success: true, data: res };
}

export async function renameChat(
  chatId: string,
  newName: string
): Promise<Result> {
  const session = await auth();
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }
  await updateRedisChatName(chatId, newName, session.user.id);
  return { success: true };
}

export async function deleteChat(chatId: string): Promise<Result> {
  const session = await auth();
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }
  await deleteRedisChat(chatId, session.user.id);
  return { success: true };
}

export async function updateRating(
  chatId: string,
  messageId: string,
  rating: AssistantRating
): Promise<Result> {
  const session = await auth();
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  const success = await updateMessageRatingInRedis(chatId, messageId, rating);
  if (!success) {
    return { success: false, error: 'Failed to update rating' };
  }

  return { success: true };
}

export async function deleteMessage(
  chatId: string,
  messageId: string
): Promise<Result> {
  const session = await auth();
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  const success = await deleteMessageFromRedis(chatId, messageId);
  if (!success) {
    return { success: false, error: 'Failed to delete message' };
  }

  return { success: true };
}
