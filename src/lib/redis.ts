import { createClient, type RedisClientType } from 'redis';

let redisClient: RedisClientType | undefined;

async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    const client: RedisClientType = createClient({
      url: process.env.REDIS_URL,
    });

    client.on('error', (err) => console.error('Redis Client Error', err));
    client.on('connect', () => console.log('Connected to Redis'));
    client.on('reconnecting', () => console.log('Reconnecting to Redis...'));
    client.on('end', () => console.log('Disconnected from Redis'));

    // Ensure the client is ready before returning it
    // Don't try to connect if already connected or connecting
    if (!client.isOpen) {
      try {
        await client.connect();
        redisClient = client; // Assign only after successful connection
      } catch (err) {
        console.error('Failed to connect to Redis:', err);
        // Optionally re-throw or handle appropriately
        throw err;
      }
    } else {
      // If already open (e.g., from a previous call), use the existing client
      redisClient = client;
    }
  }
  return redisClient;
}

export default getRedisClient;
