import { ContentType } from '@/generated/prisma-client';
import getRedisClient from '@/lib/redis';
import {
  type FunctionCallContentGetSchema,
  functionCallContentGetSchema,
  functionCallContentSchema,
  type FunctionCallContentSchema,
  type FunctionResponseContentGetSchema,
  functionResponseContentGetSchema,
  functionResponseContentSchema,
  type FunctionResponseContentSchema,
  textContentGetSchema,
  type TextContentGetSchema,
  textContentSchema,
  type TextContentSchema,
} from '@/schemas/history.schema';
import { v4 as uuidv4 } from 'uuid';

export async function getTextHistory(
  userId: string
): Promise<TextContentGetSchema[]> {
  const historyEntries: TextContentGetSchema[] = [];
  const redis = await getRedisClient();
  const keys = await redis.keys(`history:${userId}:text:*`);

  for (const key of keys) {
    const entry = await redis.hGetAll(key);
    historyEntries.push(
      textContentGetSchema.parse({
        type: ContentType.text,
        text: entry.text,
        timeSent: new Date(entry.timeSent),
        time: new Date(entry.time),
        role: entry.role,
      })
    );
  }

  return historyEntries;
}

export async function saveTextHistory(userId: string, data: TextContentSchema) {
  const redis = await getRedisClient();
  const parsedData = textContentSchema.parse(data);
  const key = `history:${userId}:text:${uuidv4()}`;

  await redis.hSet(key, {
    text: parsedData.text,
    timeSent: parsedData.timeSent.toISOString(),
    time: new Date().toISOString(),
    role: parsedData.role,
  });
  await redis.expire(key, 60 * 60 * 24); // Set expiration to 1 day
}

export async function getFunctionCallHistory(
  userId: string
): Promise<FunctionCallContentGetSchema[]> {
  const historyEntries: FunctionCallContentGetSchema[] = [];
  const redis = await getRedisClient();
  const keys = await redis.keys(`history:${userId}:function_call:*`);

  for (const key of keys) {
    const entry = await redis.hGetAll(key);
    historyEntries.push(
      functionCallContentGetSchema.parse({
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
  data: FunctionCallContentSchema
) {
  const redis = await getRedisClient();
  const parsedData = functionCallContentSchema.parse(data);
  const key = `history:${userId}:function_call:${uuidv4()}`;
  const hSetData: Record<string, string> = {
    time: new Date().toISOString(),
    name: parsedData.name,
    args: JSON.stringify(parsedData.args),
  };

  await redis.hSet(key, hSetData);
  await redis.expire(key, 60 * 60 * 24); // Set expiration to 1 day
}

export async function getFunctionResponseHistory(
  userId: string
): Promise<FunctionResponseContentGetSchema[]> {
  const historyEntries: FunctionResponseContentGetSchema[] = [];
  const redis = await getRedisClient();
  const keys = await redis.keys(`history:${userId}:function_response:*`);

  for (const key of keys) {
    const entry = await redis.hGetAll(key);
    historyEntries.push(
      functionResponseContentGetSchema.parse({
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
  data: FunctionResponseContentSchema
) {
  const redis = await getRedisClient();
  const parsedData = functionResponseContentSchema.parse(data);
  const key = `history:${userId}:function_response:${uuidv4()}`;
  const hSetData: Record<string, string> = {
    time: new Date().toISOString(),
    name: parsedData.name,
    response: JSON.stringify(parsedData.response),
  };

  await redis.hSet(key, hSetData);
  await redis.expire(key, 60 * 60 * 24); // Set expiration to 1 day
}
