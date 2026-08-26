import { Job, Worker, WorkerOptions } from 'bullmq';
import { configQueue } from '@/configs/index.js';
import { redis } from '../index.js';
import { logger } from '@/utils/index.js';

interface ProcessorOptions {
  concurrency?: number;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  workerOptions?: Omit<WorkerOptions, 'connection' | 'concurrency'>;
}

export function createProcessor<T>(
  queueName: string,
  processor: (job: Job<T>) => Promise<unknown>,
  options: ProcessorOptions = {},
) {
  const worker = new Worker<T>(queueName, processor, {
    connection: redis,
    concurrency: options.concurrency ?? configQueue.DEFAULT_CONCURRENCY,
    ...options.workerOptions,
  });

  logger.info(
    {
      queue: queueName,
      concurrency: options.concurrency ?? configQueue.DEFAULT_CONCURRENCY,
    },
    'Queue worker started',
  );

  worker.on('completed', (job) => {
    logger.info(
      {
        queue: queueName,
        jobId: job.id,
      },
      'Queue job completed',
    );
  });

  worker.on('failed', (job, error: any) => {
    logger.error(
      {
        queue: queueName,
        jobId: job?.id,
      },
      error,
      'Queue job failed',
    );
  });

  worker.on('error', (error: any) => {
    logger.error({ queue: queueName }, error, 'Queue worker error');
  });

  return worker;
}
