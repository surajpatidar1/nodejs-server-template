import { configRateLimiting } from '@/configs/index.js';
import type { Request, Response, NextFunction, RequestHandler } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

export function createRateLimiter(options: RateLimitOptions): RequestHandler {
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later.',
    keyGenerator = (req: Request) =>
      req.ip || req.socket.remoteAddress || 'unknown',
  } = options;

  const hits = new Map<string, { count: number; resetTime: number }>();

  // Periodically cleanup stale records
  const interval = setInterval(
    () => {
      const now = Date.now();
      for (const [key, record] of hits.entries()) {
        if (now > record.resetTime) {
          hits.delete(key);
        }
      }
    },
    Math.max(windowMs, 60000),
  );
  if (interval.unref) interval.unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const record = hits.get(key);

    if (!record || now > record.resetTime) {
      hits.set(key, { count: 1, resetTime: now + windowMs });
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));
      return next();
    }

    record.count++;
    const remaining = Math.max(0, max - record.count);
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
      return;
    }

    next();
  };
}

export const generalRateLimiter = createRateLimiter({
  windowMs: configRateLimiting.GENERAL_WINDOW_MS,
  max: 100,
  message: 'Too many requests. Please try again later.',
});

export const authRateLimiter = createRateLimiter({
  windowMs: configRateLimiting.AUTH_GENERAL_WINDOW_MS,
  max: 10,
  message:
    'Too many authentication attempts. Please try again after 15 minutes.',
});

export const otpRateLimiter = createRateLimiter({
  windowMs: configRateLimiting.OTP_GENERAL_WINDOW_MS,
  max: 5,
  message: 'Too many OTP requests. Please wait before requesting another code.',
});

export const uploadRateLimiter = createRateLimiter({
  windowMs: configRateLimiting.UPLOAD_GENERAL_WINDOW_MS,
  max: 20,
  message: 'Upload rate limit exceeded. Please try again shortly.',
});
