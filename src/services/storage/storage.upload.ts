import multer from 'multer';
import { configStorage } from '@/configs/index.js';
import { storageFileFilter } from './storage.filter.js';

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: configStorage.MAX_FILE_SIZE,
  },
  fileFilter: storageFileFilter,
});
