import { Server } from 'node:http';
import { ValidateServer } from '@/types/index.js';
import { startServer } from '@/server.js';
import {
  databaseService,
  redisService,
  mailService,
  storageService,
} from '@/services/index.js';
import { environmentService, logger } from '@/utils/index.js';
import { setApplicationReady } from './readiness.js';

type MailProcessor = {
  close: () => Promise<void>;
};

interface ComposeResult {
  server: Server;
  mailProcessor?: MailProcessor;
}

async function loadService<T>(
  name: string,
  load: () => Promise<T>,
): Promise<T> {
  const start = Date.now();
  try {
    const result = await load();
    logger.info(
      { service: name, durationMs: Date.now() - start },
      `[OK] ${name} connected`,
    );
    return result;
  } catch (error) {
    logger.error(
      { service: name, durationMs: Date.now() - start, error },
      `[ERROR]${name} failed to connect`,
    );
    throw new Error(
      `[ERROR] Failed to start "${name}": ${(error as Error)?.message ?? error}`,
    );
  }
}

async function loadOptionalService<T>(
  name: string,
  load: () => Promise<T>,
): Promise<T | undefined> {
  try {
    return await loadService(name, load);
  } catch {
    logger.warn(
      { service: name },
      `[WARN] Continuing without "${name}" (non-critical)`,
    );
    return undefined;
  }
}

export async function composeUp({
  port,
  appName,
  env,
}: ValidateServer): Promise<ComposeResult> {
  let mailProcessor: MailProcessor | undefined;

  await loadService('Database', () => databaseService.connect());
  await loadService('Redis', () => redisService.connect());
  await loadService('Storage', () => storageService.checkAccess());
  await loadOptionalService('Mail', () => mailService.verifyConnection());

  if (environmentService.isProduction()) {
    mailProcessor = await loadService('Mail Processor', async () => {
      const { createMailProcessor } =
        await import('@/services/mail/mail.processor.js');

      return createMailProcessor();
    });
  }

  const server = await loadService('HTTP Server', () =>
    startServer(port, appName, env),
  );
  setApplicationReady(true);
  logger.info('[OK] All services loaded successfully');

  return {
    server,
    mailProcessor,
  };
}
