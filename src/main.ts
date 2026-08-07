import {logger} from '@/utils/index.js';
import { configFactory } from '@/configs/index.js';
import { composeDown, composeUp } from '@/lifecycle/index.js';

const bootstrap = async (): Promise<void> => {
  try {
    if (
      !configFactory.PORT ||
      !configFactory.APP_NAME ||
      !configFactory.NODE_ENV
    ) {
      throw new Error('Required configuration is missing');
    }

    const server = await composeUp({
      port: Number(configFactory.PORT),
      appName: configFactory.APP_NAME,
      env: configFactory.NODE_ENV,
    });

    logger.info('Application bootstrap completed');

    process.on('SIGINT', async () => {
      await composeDown(server, 'SIGINT');
    });

    process.on('SIGTERM', async () => {
      await composeDown(server, 'SIGTERM');
    });

  } catch (error) {
    logger.fatal(error, 'Application failed to start');
    process.exit(1);
  }
};

void bootstrap();