import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { logger } from '@/utils/index.js';

interface AppError extends Error {
  statusCode?: number;
}

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        success: false,
        message: 'File size exceeds the allowed limit',
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });

    return;
  }

  if (error instanceof Error) {
    const appErr = error as AppError;
    const statusCode =
      appErr.statusCode && appErr.statusCode >= 400 && appErr.statusCode < 600
        ? appErr.statusCode
        : 500;

    if (statusCode === 500) {
      logger.error(error);
    }

    res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? 'Internal Server Error' : error.message,
    });

    return;
  }

  logger.error(new Error('Unknown error occurred'));
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
}

export function notFoundMiddleware(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
}
