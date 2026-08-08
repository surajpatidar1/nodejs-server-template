import { Redis } from 'ioredis';
import {configRedis}  from '@/configs/index.js';
import { logger } from '@/utils/index.js';

export const redis = new Redis({
    host: configRedis.HOST,
    port: configRedis.PORT,
    password: configRedis.PASSWORD || undefined,
    maxRetriesPerRequest: configRedis.maxRetriesPerRequest
});

export const redisService = {
    async connect(): Promise<void> {
        await redis.ping();
        logger.info('Redis connected successfully');
    },

    async disconnect(): Promise<void> {
        await redis.quit();
        logger.info('Redis disconnected successfully');
    },

    client: redis,
} as const;