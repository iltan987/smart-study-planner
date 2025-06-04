'use server';

import { auth } from '@/lib/auth';
import type { Result } from '@/types/response';
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
