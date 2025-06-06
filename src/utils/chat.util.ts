import { redis } from '@/lib/redis';
import { generateId } from 'ai';
import { deleteChatMessagesFromRedis } from './chat-messages.util';

const CHAT_META_PREFIX = 'chat:';
const USER_CHATS_PREFIX = 'user:';
const DEFAULT_CHAT_NAME = 'New Chat';

export async function createRedisChat(
  userId: string,
  chatName?: string
): Promise<{
  chatId: string;
  name: string;
  createdAt: Date;
}> {
  const chatId = generateId();
  const createdAt = new Date();
  const nameToStore =
    chatName && chatName.trim() !== '' ? chatName : DEFAULT_CHAT_NAME;

  const chatMetaKey = `${CHAT_META_PREFIX}${chatId}:meta`;
  const chatMetaData = {
    userId: userId,
    name: nameToStore,
    createdAt: createdAt.toISOString(),
  };
  const userChatsKey = `${USER_CHATS_PREFIX}${userId}:chats`;

  await Promise.all([
    redis.hSet(chatMetaKey, chatMetaData),
    redis.zAdd(userChatsKey, {
      score: createdAt.getTime(),
      value: chatId,
    }),
  ]);

  return { chatId, name: nameToStore, createdAt };
}

export async function getUserChatsFromRedis(userId: string): Promise<
  {
    id: string;
    name: string;
    createdAt: Date;
  }[]
> {
  const userChatsKey = `${USER_CHATS_PREFIX}${userId}:chats`;
  const chatIds = await redis.zRangeWithScores(userChatsKey, 0, -1, {
    REV: true,
  });

  if (!chatIds || chatIds.length === 0) {
    return [];
  }

  const chats: {
    id: string;
    name: string;
    createdAt: Date;
  }[] = [];
  for (const { value: chatId } of chatIds) {
    const chatMetaKey = `${CHAT_META_PREFIX}${chatId}:meta`;
    const meta = (await redis.hGetAll(chatMetaKey)) as {
      userId: string;
      name: string;
      createdAt: string;
    };
    const { userId: _, createdAt, name } = meta;
    if (meta) {
      chats.push({
        id: chatId,
        name,
        createdAt: new Date(createdAt),
      });
    }
  }
  return chats;
}

export async function getChatMetaFromRedis(chatId: string): Promise<{
  id: string;
  name: string;
  createdAt: Date;
  userId: string;
} | null> {
  const chatMetaKey = `${CHAT_META_PREFIX}${chatId}:meta`;
  const meta = (await redis.hGetAll(chatMetaKey)) as {
    userId: string;
    name: string;
    createdAt: string;
  };

  if (!meta || !meta.userId || !meta.name || !meta.createdAt) {
    // Ensure all fields are present
    return null;
  }

  return {
    id: chatId,
    name: meta.name,
    createdAt: new Date(meta.createdAt),
    userId: meta.userId,
  };
}

export async function checkIfChatExists(chatId: string): Promise<boolean> {
  const chatMetaKey = `${CHAT_META_PREFIX}${chatId}:meta`;
  const exists = await redis.exists(chatMetaKey);
  return exists > 0;
}

export async function updateRedisChatName(
  chatId: string,
  newName: string,
  userId: string
): Promise<boolean> {
  const chatMetaKey = `${CHAT_META_PREFIX}${chatId}:meta`;
  const existingUserId = await redis.hGet(chatMetaKey, 'userId');

  if (!existingUserId) {
    console.warn(`Chat ${chatId} not found in Redis for name update.`);
    return false;
  }

  if (existingUserId !== userId) {
    console.warn(
      `User ${userId} not authorized to update name for chat ${chatId}.`
    );
    return false;
  }

  await redis.hSet(chatMetaKey, 'name', newName);
  return true;
}

export async function deleteRedisChat(
  chatId: string,
  userId: string
): Promise<boolean> {
  const chatMetaKey = `${CHAT_META_PREFIX}${chatId}:meta`;
  const userChatsKey = `${USER_CHATS_PREFIX}${userId}:chats`;

  const existingChatUserId = await redis.hGet(chatMetaKey, 'userId');

  if (!existingChatUserId) {
    // Chat meta doesn't exist, perhaps already deleted or never existed.
    // Still try to remove from user's list and delete messages just in case of inconsistency.
    console.warn(`Chat meta for ${chatId} not found. Proceeding with cleanup.`);
  } else if (existingChatUserId !== userId) {
    console.warn(`User ${userId} not authorized to delete chat ${chatId}.`);
    return false;
  }

  const deleteMessagesPromise = deleteChatMessagesFromRedis(chatId);

  const redisDeletePromise = (async () => {
    const multi = redis.multi();
    multi.del(chatMetaKey);
    multi.zRem(userChatsKey, chatId);
    await multi.exec();
  })();

  try {
    await Promise.all([deleteMessagesPromise, redisDeletePromise]);
    return true;
  } catch (error) {
    console.error(`Error deleting chat ${chatId} from Redis:`, error);
    // Potentially re-throw or handle more gracefully if partial success is an issue
    return false;
  }
}
