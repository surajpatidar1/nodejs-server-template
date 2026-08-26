import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { registerModule, registry, setupSwagger } from '@/swagger/index.js';
import {
  correlationIdMiddleware,
  errorMiddleware,
  generalRateLimiter,
  notFoundMiddleware,
  uploadRateLimiter,
} from '@/middleware/index.js';
import { storageService, uploadMiddleware } from '@/services/index.js';
import { environmentService } from './utils/index.js';
import { authRouter } from './module/auth/index.js';
import { userRouter } from './module/user/index.js';
import { adminRouter } from './module/admin/index.js';
import { isApplicationReady } from './lifecycle/index.js';

export const app = express();

app.set('trust proxy', 1);

app.use(correlationIdMiddleware);
app.use(helmet());
app.use(
  cors({
    origin: (process.env.CLIENT_URL ?? '').split(',').filter(Boolean),
    credentials: true,
  }),
);
app.use(generalRateLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
  }),
);
app.use(cookieParser());
app.use(compression());

app.get('/healthz', (_req: Request, res: Response) => {
  const ready = isApplicationReady();

  return res.status(ready ? 200 : 503).json({
    success: ready,
    status: ready ? 'ok' : 'unhealthy',
  });
});

registry.registerPath({
  method: 'post',
  path: '/upload',
  tags: ['Upload'],
  summary: 'Upload a temporary file',
  security: [],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              file: { type: 'string', format: 'binary' },
            },
            required: ['file'],
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: 'File uploaded successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              filename: { type: 'string' },
              fileType: { type: 'string' },
              originalFilename: { type: 'string' },
            },
          },
        },
      },
    },
    400: { description: 'File is required' },
  },
});

app.post(
  '/upload',
  uploadRateLimiter,
  uploadMiddleware.single('file'),
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        message: 'File is required',
      });
    }

    const result = await storageService.upload({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    return res.status(200).json({
      filename: result.key,
      fileType: req.file.mimetype,
      originalFilename: req.file.originalname,
    });
  },
);

// route
registerModule(app, '/auth', authRouter, 'Auth');
registerModule(app, '/user', userRouter, 'User');
registerModule(app, '/admin', adminRouter, 'Admin');

if (environmentService.isDevelopment()) {
  setupSwagger(app);
}

app.use(notFoundMiddleware);
app.use(errorMiddleware);
