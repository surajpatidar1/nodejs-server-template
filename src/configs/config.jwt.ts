import { SignOptions } from 'jsonwebtoken';

export const configJwt = {
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET!,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET!,

  ACCESS_TOKEN_OPTIONS: {
    expiresIn: '15m',
  } satisfies SignOptions,

  REFRESH_TOKEN_OPTIONS: {
    expiresIn: '7d',
  } satisfies SignOptions,
} as const;
