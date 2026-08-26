import 'dotenv/config';

enum NodeType {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
  TEST = 'test',
}

export const configFactory = {
  NODE_ENV: process.env.NODE_ENV as NodeType,
  PORT: Number(process.env.PORT ?? 7001),
  LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
  APP_NAME: process.env.APP_NAME ?? 'Node server',
} as const;
