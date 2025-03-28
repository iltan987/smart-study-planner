import redisClient from '@/lib/redis';
import {
  functionCallContentSchema,
  type FunctionCallContentSchema,
  functionResponseContentSchema,
  type FunctionResponseContentSchema,
  textContentSchema,
  type TextContentSchema,
} from '@/schemas/history.schema';
import { ContentType } from '@prisma/client';
import 'server-only';

export async function getTextHistory(userId: string) {
  const historyEntries: TextContentSchema[] = [];
  const keys = await redisClient.keys(`history:${userId}:text:*`);

  for (const key of keys) {
    const entry = await redisClient.hGetAll(key);
    historyEntries.push(
      textContentSchema.parse({
        type: ContentType.TEXT,
        role: entry.role,
        time: new Date(entry.time),
        text: entry.text,
      })
    );
  }

  return historyEntries;
}

export async function saveTextHistory(
  userId: string,
  message: TextContentSchema
) {
  const key = `history:${userId}:text:${message.time.getTime()}`;
  await redisClient.hSet(key, {
    role: message.role,
    time: message.time.toISOString(),
    text: message.text,
  });
  await redisClient.expire(key, 60 * 60 * 24); // Set expiration to 1 day
}

export async function getFunctionCallHistory(userId: string) {
  const historyEntries: FunctionCallContentSchema[] = [];
  const keys = await redisClient.keys(`history:${userId}:function_call:*`);

  for (const key of keys) {
    const entry = await redisClient.hGetAll(key);
    historyEntries.push(
      functionCallContentSchema.parse({
        type: ContentType.FUNCTION_CALL,
        time: new Date(entry.time),
        name: entry.name,
        args: JSON.parse(entry.args),
      })
    );
  }

  return historyEntries;
}

export async function saveFunctionCallHistory(
  userId: string,
  message: FunctionCallContentSchema
) {
  const key = `history:${userId}:function_call:${message.time.getTime()}`;
  await redisClient.hSet(key, {
    time: message.time.toISOString(),
    name: message.name,
    args: JSON.stringify(message.args),
  });
  await redisClient.expire(key, 60 * 60 * 24); // Set expiration to 1 day
}

export async function getFunctionResponseHistory(userId: string) {
  const historyEntries: FunctionResponseContentSchema[] = [];
  const keys = await redisClient.keys(`history:${userId}:function_response:*`);

  for (const key of keys) {
    const entry = await redisClient.hGetAll(key);
    historyEntries.push(
      functionResponseContentSchema.parse({
        type: ContentType.FUNCTION_RESPONSE,
        time: new Date(entry.time),
        name: entry.name,
        response: JSON.parse(entry.response),
      })
    );
  }

  return historyEntries;
}

export async function saveFunctionResponseHistory(
  userId: string,
  message: FunctionResponseContentSchema
) {
  const key = `history:${userId}:function_response:${message.time.getTime()}`;
  await redisClient.hSet(key, {
    time: message.time.toISOString(),
    name: message.name,
    response: JSON.stringify(message.response),
  });
  await redisClient.expire(key, 60 * 60 * 24); // Set expiration to 1 day
}
