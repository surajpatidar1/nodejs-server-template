import jwt from 'jsonwebtoken';
import { configJwt } from '@/configs/index.js';
import type { JwtPayload } from '@/types/index.js';
import { UnauthorizedException } from '@/utils/exceptions.js';

export enum TokenType {
  ACCESS_TOKEN = 'access_token',
  REFRESH_TOKEN = 'refresh_token',
}

export const jwtService = {
  sign(payload: JwtPayload, type: TokenType): string {
    const secret =
      type === TokenType.ACCESS_TOKEN
        ? configJwt.ACCESS_TOKEN_SECRET
        : configJwt.REFRESH_TOKEN_SECRET;

    const options =
      type === TokenType.ACCESS_TOKEN
        ? configJwt.ACCESS_TOKEN_OPTIONS
        : configJwt.REFRESH_TOKEN_OPTIONS;

    return jwt.sign(payload, secret, options);
  },

  verify(token: string, type: TokenType): JwtPayload {
    const secret =
      type === TokenType.ACCESS_TOKEN
        ? configJwt.ACCESS_TOKEN_SECRET
        : configJwt.REFRESH_TOKEN_SECRET;

    try {
      return jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw UnauthorizedException('Token has expired');
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw UnauthorizedException('Invalid token');
      }

      throw error;
    }
  },

  decode(token: string) {
    return jwt.decode(token);
  },
} as const;
