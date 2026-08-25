import { app } from './app.js';
import { logger } from '@/utils/index.js';
import type { Server } from 'node:http';

export const startServer = (
  port: number,
  appName: string,
  env: string,
): Promise<Server> => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      logger.info(
        {
          app: appName,
          env,
          port,
        },
        'HTTP server is listening',
      );

      resolve(server);
    });

    server.once('error', (error) => {
      logger.fatal(error, 'Failed to start server');
      reject(error);
    });
  });
};

export const shutdownServer = (
  server: Server,
  signal: string,
  timeoutMs = 10_000,
): Promise<void> => {
  return new Promise((resolve) => {
    logger.info({ signal }, 'Graceful shutdown initiated');

    const forceTimer = setTimeout(() => {
      logger.warn(
        { signal, timeoutMs },
        'Graceful shutdown timed out — forcing close',
      );
      resolve();
    }, timeoutMs);
    forceTimer.unref();

    server.close((error) => {
      clearTimeout(forceTimer);

      if (error) {
        logger.error(error, 'Error while closing HTTP server');
      } else {
        logger.info('HTTP server closed');
      }

      resolve();
    });
  });
};
