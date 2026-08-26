import type { Request, Response } from 'express';
import { authService } from './index.js';
import {
  cookieService,
  jwtService,
  oauthService,
  TokenType,
} from '@/services/index.js';
import { UserType } from '@/types/index.js';
import { UnauthorizedException } from '@/utils/exceptions.js';

export const sendCode = async (req: Request, res: Response) => {
  const data = req.body;
  const result = await authService.sendCode(data);

  return res.status(200).json({
    ...result,
  });
};

export const checkUsername = async (req: Request, res: Response) => {
  const { name } = req.body;
  const username = await authService.generateAvailableUsername(name);

  return res.status(200).json({
    success: true,
    username,
  });
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[TokenType.REFRESH_TOKEN];
  if (!refreshToken) throw UnauthorizedException('Refresh token required.');

  const { accessToken } = await authService.refreshToken(refreshToken);

  cookieService.set(res, TokenType.ACCESS_TOKEN, accessToken);

  return res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
  });
};

export const register = async (req: Request, res: Response) => {
  const data = req.body;
  const user = await authService.register(data);
  const token = jwtService.sign(
    {
      sub: String(user.id),
      type: UserType.USER,
    },
    TokenType.ACCESS_TOKEN,
  );

  cookieService.set(res, TokenType.ACCESS_TOKEN, token);

  return res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user,
  });
};

export const login = async (req: Request, res: Response) => {
  const data = req.body;
  const result = await authService.login(data);
  const accessToken = jwtService.sign(
    {
      sub: String(result.user.id),
      type: result.type,
    },
    TokenType.ACCESS_TOKEN,
  );

  const refreshToken = jwtService.sign(
    {
      sub: String(result.user.id),
      type: result.type,
    },
    TokenType.REFRESH_TOKEN,
  );

  cookieService.set(res, TokenType.ACCESS_TOKEN, accessToken);
  cookieService.set(res, TokenType.REFRESH_TOKEN, refreshToken);

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    result,
  });
};

export const googleAuthUrl = async (req: Request, res: Response) => {
  const url = oauthService.getAuthorizationUrl('google');
  return res.status(200).json({
    success: true,
    url,
  });
};

export const googleCallback = async (req: Request, res: Response) => {
  const code = (req.body?.code || req.query?.code) as string;
  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Authorization code is required.',
    });
  }

  const result = await authService.googleAuth(code);
  cookieService.set(res, TokenType.ACCESS_TOKEN, result.accessToken);
  cookieService.set(res, TokenType.REFRESH_TOKEN, result.refreshToken);

  return res.status(200).json({
    success: true,
    message: 'Google authentication successful',
    user: result.user,
  });
};
