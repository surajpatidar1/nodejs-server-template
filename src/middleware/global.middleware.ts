import type { NextFunction, Request, Response } from 'express';
import {logger} from '@/utils/index.js';

export function errorMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error(error);

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
}

export function notFoundMiddleware(
  _req: Request,
  res: Response,
): void {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
}