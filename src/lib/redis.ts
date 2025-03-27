import { createClient } from 'redis';

// Define the Redis client type
export type RedisClientType = ReturnType<typeof createClient>;

// Global instance to maintain singleton pattern
let redisClientInstance: RedisClientType | null = null;

async function getRedisClient(): Promise<RedisClientType> {
  // If the client already exists, return it
  if (redisClientInstance) {
    return redisClientInstance;
  }

  // Create a new Redis client
  const client = createClient({
    url: process.env.REDIS_URL,
  });

  // Add error handler
  client.on('error', (err) => {
    console.error('Redis client error:', err);
  });

  // Connect to Redis
  await client.connect();

  // Store the instance
  redisClientInstance = client;

  return client;
}

// For graceful shutdown
export async function closeRedisConnection(): Promise<void> {
  if (redisClientInstance) {
    await redisClientInstance.quit();
    redisClientInstance = null;
  }
}

const redisClient = await getRedisClient();
export default redisClient;
