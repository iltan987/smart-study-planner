import redisClient from '@/lib/redis';
import { type HistorySchema, historySchema } from '@/schemas/history.schema';
import { ContentType } from '@prisma/client';

export async function getTextHistory(userId: string) {
  const historyEntries: HistorySchema[] = [];
  const keys = await redisClient.keys(`history:${userId}:text:*`);

  for (const key of keys) {
    const entry = await redisClient.hGetAll(key);
    historyEntries.push(
      historySchema.parse({
        role: entry.role,
        time: new Date(entry.time),
        content: {
          type: ContentType.TEXT,
          textContent: { text: entry.content },
        },
      })
    );
  }

  return historyEntries;
}

export async function getFunctionCallHistory(userId: string) {
  const historyEntries: HistorySchema[] = [];
  const keys = await redisClient.keys(`history:${userId}:function_call:*`);

  for (const key of keys) {
    const entry = await redisClient.hGetAll(key);
    historyEntries.push(
      historySchema.parse({
        role: entry.role,
        time: new Date(entry.time),
        content: {
          type: ContentType.FUNCTION_CALL,
          functionCallContent: {
            name: entry.content_name,
            arguments: JSON.parse(entry.content_arguments),
          },
        },
      })
    );
  }

  return historyEntries;
}

export async function getFunctionResponseHistory(userId: string) {
  const historyEntries: HistorySchema[] = [];
  const keys = await redisClient.keys(`history:${userId}:function_response:*`);

  for (const key of keys) {
    const entry = await redisClient.hGetAll(key);
    historyEntries.push(
      historySchema.parse({
        role: entry.role,
        time: new Date(entry.time),
        content: {
          type: ContentType.FUNCTION_RESPONSE,
          functionResponseContent: {
            name: entry.content_name,
            response: JSON.parse(entry.content_response),
          },
        },
      })
    );
  }

  return historyEntries;
}
