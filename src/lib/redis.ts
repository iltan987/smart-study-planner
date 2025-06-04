import type { RedisClientType } from 'redis';
import { createClient } from 'redis';

type RedisClient = RedisClientType;

const globalForRedis = globalThis as unknown as {
  redisClient: RedisClient | undefined;
};

let redisClient: RedisClient;

if (process.env.NODE_ENV === 'production') {
  redisClient = createClient({ url: process.env.REDIS_URL });
} else {
  if (!globalForRedis.redisClient) {
    globalForRedis.redisClient = createClient({ url: process.env.REDIS_URL });
  }
  redisClient = globalForRedis.redisClient;
}

redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('ready', () => {
  console.log('Redis client is ready');
});

redisClient.on('end', () => {
  console.log('Redis client disconnected');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('reconnecting', () => {
  console.log('Redis client reconnecting...');
});

export const redis = redisClient;

async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

connectRedis();

export async function disconnectRedis() {
  if (redis.isOpen) {
    await redis.quit();
    console.log('Redis client disconnected gracefully');
  }
}
