export const configRedis = {
  HOST: process.env.REDIS_HOST ?? 'localhost',
  PORT: Number(process.env.REDIS_PORT ?? 6379),
  PASSWORD: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
} as const;
