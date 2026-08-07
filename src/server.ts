import { app } from './app.js';
import {logger} from '@/utils/index.js';

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

    server.on('error', (error) => {
      logger.fatal(error, 'Failed to start server');
      reject(error);
    });
  });
};

export const shutdownServer = (
  server: Server,
  signal: string,
): void => {
  logger.info(
    {
      signal,
    },
    'Graceful shutdown initiated',
  );

  server.close(() => {
    logger.info('HTTP server closed');
  });
};