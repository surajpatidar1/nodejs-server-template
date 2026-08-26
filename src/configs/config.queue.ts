export const configQueue = {
  DEFAULT_CONCURRENCY: Number(process.env.QUEUE_CONCURRENCY ?? 5),
  DEFAULT_ATTEMPTS: Number(process.env.QUEUE_ATTEMPTS ?? 3),
  BACKOFF_DELAY: Number(process.env.QUEUE_BACKOFF_DELAY ?? 1000),
} as const;
