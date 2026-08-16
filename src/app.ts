import crypto from 'node:crypto';
import fs from 'node:fs';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import multer from 'multer';
import { registerModule, registry, setupSwagger } from '@/swagger/index.js';
import { errorMiddleware, notFoundMiddleware } from '@/middleware/index.js';
import authRouter from './module/auth/auth.route.js';
import userRouter from './module/user/user.route.js';
import adminRouter from './module/admin/admin.route.js';
import { configStorage } from './configs/index.js';
import { environmentService } from './utils/index.js';

export const app = express();

app.set('trust proxy', 1);

const UPLOAD_DIR = configStorage.LOCAL.TEMP_DESTINATION;
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
      cb(null, `${crypto.randomUUID()}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    cb(
      null,
      configStorage.ALLOWED_MIMETYPES.some(
        (allowedMimeType) => allowedMimeType === file.mimetype,
      ),
    );
  },
});

app.use(helmet());
app.use(
  cors({
    origin: (process.env.CLIENT_URL ?? '').split(',').filter(Boolean),
    credentials: true,
  }),
);

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
  res.status(200).json({ status: 'ok' });
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
  upload.single('file'),
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        message: 'File is required',
      });
    }

    return res.status(200).json({
      filename: req.file.filename,
      fileType: req.file.mimetype,
      originalFilename: req.file.originalname,
    });
  },
);
app.post(
  '/upload',
  upload.single('file'),
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({
        message: 'File is required',
      });
    }

    return res.status(200).json({
      filename: req.file.filename,
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
