import redisClient from '@/lib/redis';
import {
  type CreateFunctionCallContentSchema,
  type CreateFunctionResponseContentSchema,
  type CreateTextContentSchema,
  functionCallContentSchema,
  type FunctionCallContentSchema,
  functionResponseContentSchema,
  type FunctionResponseContentSchema,
  textContentSchema,
  type TextContentSchema,
} from '@/schemas/history.schema';
import { Role } from '@prisma/client';
import 'server-only';

export async function getTextHistory(userId: string) {
  const historyEntries: TextContentSchema[] = [];
  const keys = await redisClient.keys(`history:${userId}:text:*`);

  for (const key of keys) {
    const entry = await redisClient.hGetAll(key);
    historyEntries.push(
      textContentSchema.parse({
        role: entry.role,
        time: new Date(entry.time),
        text: entry.text,
        timeSent: new Date(entry.timeSent),
      })
    );
  }

  return historyEntries;
}

export async function saveTextHistory(
  userId: string,
  message: CreateTextContentSchema
) {
  const now = new Date();
  const key = `history:${userId}:text:${now.getTime()}`;
  await redisClient.hSet(key, {
    role: message.role,
    time: now.toISOString(),
    ...(message.role === Role.USER
      ? { timeSent: message.timeSent.toISOString() }
      : {}),
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
  message: CreateFunctionCallContentSchema
) {
  const now = new Date();
  const key = `history:${userId}:function_call:${now.getTime()}`;
  await redisClient.hSet(key, {
    time: now.toISOString(),
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
  message: CreateFunctionResponseContentSchema
) {
  const now = new Date();
  const key = `history:${userId}:function_response:${now.getTime()}`;
  await redisClient.hSet(key, {
    time: now.toISOString(),
    name: message.name,
    response: JSON.stringify(message.response),
  });
  await redisClient.expire(key, 60 * 60 * 24); // Set expiration to 1 day
}
