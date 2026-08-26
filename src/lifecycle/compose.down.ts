import type { Server } from 'node:http';
import { shutdownServer } from '@/server.js';
import { databaseService, redisService } from '@/services/index.js';
import { logger } from '@/utils/index.js';
import { setApplicationReady } from './readiness.js';

type MailProcessor = {
  close: () => Promise<void>;
};

export async function composeDown(
  server: Server,
  signal: string,
  mailProcessor?: MailProcessor,
): Promise<void> {
  setApplicationReady(false);
  await shutdownServer(server, signal);

  if (mailProcessor) {
    await mailProcessor.close();
    logger.info('[OK] Mail worker closed');
  }

  await redisService.disconnect();
  logger.info('[OK] Redis disconnected');

  await databaseService.disconnect();
  logger.info('[OK] Database disconnected');
  logger.info({ signal }, '[DONE] Shutdown complete');
}
