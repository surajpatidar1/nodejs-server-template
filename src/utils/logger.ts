import pino from 'pino';
import { configFactory,  configLoggerFactory } from '@/configs/index.js';
import {environmentService} from './environment.js';


export const logger = environmentService.isDevelopment()
  ? pino(
      {
        ...configLoggerFactory,
        timestamp: pino.stdTimeFunctions.isoTime,
        base: {
          service: configFactory.APP_NAME,
        },
      },
      pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: true,
        },
      }),
    )
  : pino({
      ...configLoggerFactory,
      timestamp: pino.stdTimeFunctions.isoTime,
      base: {
        service: configFactory.APP_NAME,
      },
    });
