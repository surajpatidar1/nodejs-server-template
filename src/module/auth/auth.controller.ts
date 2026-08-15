import type { Request, Response } from 'express';
import { authService } from './index.js';
import { cookieService, jwtService, TokenType } from '@/services/index.js';
import { UserType } from '@/types/index.js';

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
