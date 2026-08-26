import { logger } from '@/utils/index.js';
import { configFactory } from '@/configs/index.js';
import { composeDown, composeUp } from '@/lifecycle/index.js';

const bootstrap = async (): Promise<void> => {
  process.on('unhandledRejection', (reason) => {
    logger.fatal(reason, '[FATAL] Unhandled promise rejection');
    process.exit(1);
  });

  process.on('uncaughtException', (error) => {
    logger.fatal(error, '[FATAL] Uncaught exception');
    process.exit(1);
  });

  try {
    if (
      !configFactory.PORT ||
      !configFactory.APP_NAME ||
      !configFactory.NODE_ENV
    ) {
      throw new Error('Required configuration is missing');
    }

    const port = Number(configFactory.PORT);
    if (Number.isNaN(port)) {
      throw new Error(`Invalid PORT value: ${configFactory.PORT}`);
    }

    const { server, mailProcessor } = await composeUp({
      port,
      appName: configFactory.APP_NAME,
      env: configFactory.NODE_ENV,
    });

    logger.info('[READY] Application bootstrap completed');

    let shuttingDown = false;

    const shutdown = async (signal: string) => {
      if (shuttingDown) {
        logger.warn(
          { signal },
          '[WARN] Shutdown already in progress, ignoring',
        );
        return;
      }
      shuttingDown = true;

      try {
        await composeDown(server, signal, mailProcessor);
        logger.info({ signal }, '[DONE] Shutdown complete');
        process.exit(0);
      } catch (error) {
        logger.fatal(error, '[ERROR] Error during shutdown');
        process.exit(1);
      }
    };

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
  } catch (error) {
    logger.fatal(error, '[ERROR] Application failed to start');
    process.exit(1);
  }
};

void bootstrap();
