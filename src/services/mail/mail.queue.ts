import { Queue } from 'bullmq';
import { configQueue } from '@/configs/index.js';
import { redis } from '../index.js';

export const MAIL_QUEUE = 'mail';

export interface MailJobData {
  to: string;
  subject: string;
  html: string;
}

export const mailQueue = new Queue<MailJobData>(MAIL_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    attempts: configQueue.DEFAULT_ATTEMPTS,
    backoff: {
      type: 'exponential',
      delay: configQueue.BACKOFF_DELAY,
    },
    removeOnComplete: 100,
    removeOnFail: 1000,
  },
});
