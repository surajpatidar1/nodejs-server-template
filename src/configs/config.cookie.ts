import type { CookieOptions } from 'express';
import { environmentService } from '@/utils/environment.js';
import { TokenType } from '@/services/index.js';

export const configCookie = {
  ACCESS_TOKEN_NAME: TokenType.ACCESS_TOKEN,
  REFRESH_TOKEN_NAME: TokenType.REFRESH_TOKEN,

  ACCESS_TOKEN_OPTIONS: {
    httpOnly: true,
    secure: environmentService.isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60 * 1000,
  } satisfies CookieOptions,

  REFRESH_TOKEN_OPTIONS: {
    httpOnly: true,
    secure: environmentService.isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  } satisfies CookieOptions,
} as const;
