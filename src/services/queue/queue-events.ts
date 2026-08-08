import { QueueEvents } from 'bullmq';
import { redis } from '../index.js';
import { logger } from '@/utils/index.js';

export function createQueueEvents(
    queueName: string,
) {
    const events = new QueueEvents(queueName, {
        connection: redis,
    });

    events.on('completed', ({ jobId }) => {
        logger.info(
            {
                queue: queueName,
                jobId,
            },
            'Queue event completed',
        );
    });

    events.on('failed', ({ jobId, failedReason }) => {
        logger.error(
            {
                queue: queueName,
                jobId,
                failedReason,
            },
            'Queue event failed',
        );
    });

    events.on('error', (error: any) => {
        logger.error(
            {
                queue: queueName,
            },
            error,
            'Queue events error',
        );
    });

    return events;
}