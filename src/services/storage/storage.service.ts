import { configStorage } from '@/configs/index.js';
import { localStorageProvider } from './providers/local.provider.js';
import { s3StorageProvider } from './providers/s3.provider.js';
import { cloudinaryStorageProvider } from './providers/cloudinary.provider.js';

const providers = {
  local: localStorageProvider,
  s3: s3StorageProvider,
  cloudinary: cloudinaryStorageProvider,
} as const;

const provider = providers[configStorage.PROVIDER as keyof typeof providers];

if (!provider) {
  throw new Error(`Unsupported storage provider: ${configStorage.PROVIDER}`);
}

export const storageService = {
  upload: provider.upload,
  delete: provider.delete,
  getUrl: provider.getUrl,
  move: provider.move,
} as const;
