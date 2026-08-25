import type { Server } from 'node:http';
import { shutdownServer } from '@/server.js';
import { databaseService, redisService } from '@/services/index.js';
import { logger } from '@/utils/index.js';

type MailProcessor = {
  close: () => Promise<void>;
};

export async function composeDown(
  server: Server,
  signal: string,
  mailProcessor?: MailProcessor,
): Promise<void> {
  await shutdownServer(server, signal);

  if (mailProcessor) {
    await mailProcessor.close();
    logger.info('Mail worker closed');
  }

  await redisService.disconnect();
  await databaseService.disconnect();
}
