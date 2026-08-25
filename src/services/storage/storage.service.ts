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

const HEALTH_CHECK_FILENAME = '__healthcheck__.txt';

export const storageService = {
  upload: provider.upload,
  delete: provider.delete,
  getUrl: provider.getUrl,
  move: provider.move,

  async checkAccess(): Promise<void> {
    const file = {
      buffer: Buffer.from(`healthcheck-${Date.now()}`),
      originalName: HEALTH_CHECK_FILENAME,
      mimeType: 'text/plain',
      size: configStorage.MAX_FILE_SIZE,
    };

    let key: string;

    try {
      const result = await provider.upload(file);
      key = result.key;
    } catch (error) {
      throw new Error(
        `Storage provider "${configStorage.PROVIDER}" upload check failed: ${
          (error as Error)?.message ?? error
        }`,
      );
    }

    try {
      await provider.delete(key);
    } catch (error) {
      console.warn(
        `Storage health-check cleanup failed for key "${key}":`,
        error,
      );
    }
  },
} as const;
