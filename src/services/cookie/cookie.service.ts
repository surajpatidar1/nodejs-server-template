import type { Response } from 'express';
import { configCookie } from '@/configs/index.js';
import { TokenType } from '../index.js';

export const cookieService = {
  set(response: Response, type: TokenType, token: string): void {
    const name =
      type === TokenType.ACCESS_TOKEN
        ? configCookie.ACCESS_TOKEN_NAME
        : configCookie.REFRESH_TOKEN_NAME;

    const options =
      type === TokenType.ACCESS_TOKEN
        ? configCookie.ACCESS_TOKEN_OPTIONS
        : configCookie.REFRESH_TOKEN_OPTIONS;

    response.cookie(name, token, options);
  },

  clear(response: Response, type: TokenType): void {
    const name =
      type === TokenType.ACCESS_TOKEN
        ? configCookie.ACCESS_TOKEN_NAME
        : configCookie.REFRESH_TOKEN_NAME;

    const options =
      type === TokenType.ACCESS_TOKEN
        ? configCookie.ACCESS_TOKEN_OPTIONS
        : configCookie.REFRESH_TOKEN_OPTIONS;

    response.clearCookie(name, options);
  },

  clearAll(response: Response): void {
    response.clearCookie(
      configCookie.ACCESS_TOKEN_NAME,
      configCookie.ACCESS_TOKEN_OPTIONS,
    );

    response.clearCookie(
      configCookie.REFRESH_TOKEN_NAME,
      configCookie.REFRESH_TOKEN_OPTIONS,
    );
  },
} as const;
