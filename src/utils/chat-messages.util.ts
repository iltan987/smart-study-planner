import { redis } from '@/lib/redis';
import type { AssistantRating } from '@/types/assistant-rating';
import type { Message, UIMessage } from 'ai';

const CHAT_MESSAGES_IDS_LIST_PREFIX = 'chat:';
const MESSAGE_DATA_HASH_PREFIX = 'message:';
const CHAT_RATINGS_HASH_PREFIX = 'chat_ratings:';

export async function addMessageToRedisChat(
  chatId: string,
  message: Message
): Promise<void> {
  const messageDataKey = `${MESSAGE_DATA_HASH_PREFIX}${message.id}:data`;
  const chatMessageIdsKey = `${CHAT_MESSAGES_IDS_LIST_PREFIX}${chatId}:message_ids`;

  const messageToStore: UIMessage = {
    ...message,
    parts: message.parts || [{ type: 'text', text: message.content }],
    createdAt:
      message.createdAt instanceof Date
        ? message.createdAt
        : new Date(message.createdAt || Date.now()),
  };
  const messageString: Record<string, string> = {
    ...(messageToStore.annotations && {
      annotations: JSON.stringify(messageToStore.annotations),
    }),
    content: messageToStore.content,
    ...(messageToStore.createdAt && {
      createdAt: messageToStore.createdAt.toISOString(),
    }),
    id: messageToStore.id,
    parts: JSON.stringify(messageToStore.parts),
    role: messageToStore.role,
  };

  const isExistingMessage = await redis.exists(messageDataKey);

  const multi = redis.multi();
  multi.hSet(messageDataKey, messageString);

  if (!isExistingMessage) {
    multi.rPush(chatMessageIdsKey, message.id);
  }

  await multi.exec();
}

export async function getMessagesFromRedisChat(
  chatId: string
): Promise<Message[]> {
  const chatMessageIdsKey = `${CHAT_MESSAGES_IDS_LIST_PREFIX}${chatId}:message_ids`;
  const messageIds = await redis.lRange(chatMessageIdsKey, 0, -1);

  if (!messageIds || messageIds.length === 0) {
    return [];
  }

  const messages: Message[] = [];
  const messageDataMulti = redis.multi();
  messageIds.forEach((msgId) => {
    messageDataMulti.hGetAll(`${MESSAGE_DATA_HASH_PREFIX}${msgId}:data`);
  });
  const messageDataResults =
    (await messageDataMulti.exec()) as unknown as (Record<
      string,
      string
    > | null)[];

  for (let i = 0; i < messageIds.length; i++) {
    const msgId = messageIds[i];
    const currentEntry = messageDataResults[i];

    if (currentEntry) {
      try {
        const parsedMessage: Message = {
          ...(currentEntry.annotations && {
            annotations: JSON.parse(currentEntry.annotations),
          }),
          content: currentEntry.content,
          ...(currentEntry.createdAt && {
            createdAt: new Date(currentEntry.createdAt),
          }),
          id: currentEntry.id,
          ...(currentEntry.parts
            ? { parts: JSON.parse(currentEntry.parts) }
            : {}),
          role: currentEntry.role as Message['role'],
        };
        messages.push(parsedMessage);
      } catch (error) {
        console.warn(
          `Failed to parse message data for message ${msgId} in chat ${chatId}:`,
          error
        );
      }
    } else {
      console.warn(
        `Data for message ${msgId} in chat ${chatId} not found or incomplete in Redis.`
      );
    }
  }
  return messages;
}

export async function getMessageRatingFromRedis(
  chatId: string,
  messageId: string
): Promise<AssistantRating | null> {
  const chatRatingsKey = `${CHAT_RATINGS_HASH_PREFIX}${chatId}`;
  const ratingStoredValue = await redis.hGet(chatRatingsKey, messageId);

  if (ratingStoredValue === null || ratingStoredValue === undefined) {
    return null;
  }
  if (ratingStoredValue === 'null') {
    return null;
  }
  return ratingStoredValue as AssistantRating;
}

export async function getChatRatingsFromRedis(
  chatId: string
): Promise<Record<string, AssistantRating | null>> {
  const chatRatingsKey = `${CHAT_RATINGS_HASH_PREFIX}${chatId}`;
  const allRatings = await redis.hGetAll(chatRatingsKey);

  if (!allRatings) {
    return {};
  }

  const ratingsMap: Record<string, AssistantRating | null> = {};
  for (const messageId in allRatings) {
    if (Object.prototype.hasOwnProperty.call(allRatings, messageId)) {
      const ratingValue = allRatings[messageId];
      ratingsMap[messageId] =
        ratingValue === 'null' ? null : (ratingValue as AssistantRating);
    }
  }
  return ratingsMap;
}

export async function updateMessageRatingInRedis(
  chatId: string,
  messageId: string,
  newRating: AssistantRating
): Promise<boolean> {
  const messageDataKey = `${MESSAGE_DATA_HASH_PREFIX}${messageId}:data`;
  const chatRatingsKey = `${CHAT_RATINGS_HASH_PREFIX}${chatId}`;

  const messageRole = await redis.hGet(messageDataKey, 'role');

  if (!messageRole) {
    console.warn(`Message ${messageId} not found in Redis for rating update.`);
    return false;
  }

  try {
    if (newRating === null) {
      await redis.hDel(chatRatingsKey, messageId);
      return true;
    }
    if (messageRole !== 'assistant') {
      console.warn(`Attempted to rate non-assistant message ${messageId}.`);
      return false;
    }

    await redis.hSet(chatRatingsKey, messageId, String(newRating));
    return true;
  } catch (error) {
    console.error(`Error updating rating for message ${messageId}:`, error);
    return false;
  }
}

export async function deleteMessageFromRedis(
  chatId: string,
  messageId: string
): Promise<boolean> {
  const chatMessageIdsKey = `${CHAT_MESSAGES_IDS_LIST_PREFIX}${chatId}:message_ids`;
  const messageDataKey = `${MESSAGE_DATA_HASH_PREFIX}${messageId}:data`;
  const chatRatingsKey = `${CHAT_RATINGS_HASH_PREFIX}${chatId}`;

  try {
    const multi = redis.multi();
    // Remove the message ID from the list of message IDs for the chat
    multi.lRem(chatMessageIdsKey, 0, messageId);
    // Delete the actual message data
    multi.del(messageDataKey);
    // Delete any rating associated with this message
    multi.hDel(chatRatingsKey, messageId);

    await multi.exec();
    return true;
  } catch (error) {
    console.error(
      `Error deleting message ${messageId} from chat ${chatId} in Redis:`,
      error
    );
    return false;
  }
}

export async function deleteChatMessagesFromRedis(
  chatId: string
): Promise<void> {
  const chatMessageIdsKey = `${CHAT_MESSAGES_IDS_LIST_PREFIX}${chatId}:message_ids`;
  const chatRatingsKey = `${CHAT_RATINGS_HASH_PREFIX}${chatId}`;
  const messageIds = await redis.lRange(chatMessageIdsKey, 0, -1);

  const multi = redis.multi();

  if (messageIds && messageIds.length > 0) {
    messageIds.forEach((msgId) => {
      multi.del(`${MESSAGE_DATA_HASH_PREFIX}${msgId}:data`);
    });
  }
  multi.del(chatMessageIdsKey);
  multi.del(chatRatingsKey);
  await multi.exec();
}

export async function rateMessageInRedis(
  chatId: string,
  messageId: string,
  rating: AssistantRating
): Promise<boolean> {
  const chatMessageIdsKey = `${CHAT_MESSAGES_IDS_LIST_PREFIX}${chatId}:message_ids`;
  const messageIds = await redis.lRange(chatMessageIdsKey, 0, -1);

  if (!messageIds.includes(messageId)) {
    console.warn(
      `Message ${messageId} not found in chat ${chatId} for rating.`
    );
    return false;
  }

  return updateMessageRatingInRedis(chatId, messageId, rating);
}
