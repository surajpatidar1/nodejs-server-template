import { Redis } from 'ioredis';
import { configRedis } from '@/configs/index.js';

export const redis = new Redis({
  host: configRedis.HOST,
  port: configRedis.PORT,
  password: configRedis.PASSWORD || undefined,
  maxRetriesPerRequest: configRedis.maxRetriesPerRequest,
});

export const redisService = {
  async connect(): Promise<void> {
    await redis.ping();
  },

  async disconnect(): Promise<void> {
    await redis.quit();
  },

  client: redis,
} as const;
