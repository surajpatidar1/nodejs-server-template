import crypto from 'node:crypto';
import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import multer from 'multer';
import { setupSwagger } from '@/swagger/index.js';
import { errorMiddleware, notFoundMiddleware } from '@/middleware/index.js';
import authRouter from './module/auth/auth.route.js';
import userRouter from './module/user/user.route.js';
import adminRouter from './module/admin/admin.route.js';

export const app = express();
const upload = multer({
  storage: multer.diskStorage({
    destination: 'storage/tmp',
    filename: (_req, file, cb) => {
      cb(null, `${crypto.randomUUID()}-${file.originalname}`);
    },
  }),
});

app.use(helmet()); // Security
app.use(cors()); // Cors
app.use(express.json()); // Body parser
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(cookieParser()); // Cookies
app.use(compression()); // compression
setupSwagger(app); // swagger

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

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
