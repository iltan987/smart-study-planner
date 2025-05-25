import { createClient } from 'redis';

const globalForRedis = globalThis as unknown as { redis: RedisClient };
const client = createClient();

client.on('connect', () => console.log('Redis Client Connected'));
client.on('ready', () => console.log('Redis Client Ready'));
client.on('end', () => console.log('Redis Client Disconnected'));
client.on('error', (err) => console.log('Redis Client Error', err));
client.on('reconnecting', () => console.log('Redis Client Reconnecting'));

await client.connect();

globalForRedis.redis = client;
export const redis = globalForRedis.redis || client;
if (process.env.NODE_ENV !== 'production') globalForRedis.redis = client;
export type RedisClient = typeof client;
