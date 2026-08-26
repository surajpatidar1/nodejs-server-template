import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

import { configStorage } from '@/configs/index.js';
import { BadRequestException } from '@/utils/exceptions.js';
import type { StorageFile, StorageResult } from '../storage.types.js';

const destination = path.resolve(configStorage.LOCAL.DESTINATION);
const ensureDirectory = async (
  directory: string = destination,
): Promise<void> => {
  await fs.mkdir(directory, {
    recursive: true,
  });
};

const resolvePath = (key: string): string => {
  const filePath = path.resolve(destination, key);

  if (!filePath.startsWith(`${destination}${path.sep}`)) {
    throw new Error('Invalid storage key');
  }

  return filePath;
};

const upload = async (file: StorageFile): Promise<StorageResult> => {
  const tmpDir = path.resolve(destination, 'tmp');
  await ensureDirectory(tmpDir);

  const extension = path.extname(file.originalName);
  const key = `tmp/${crypto.randomUUID()}${extension}`;
  const filePath = resolvePath(key);

  await fs.writeFile(filePath, file.buffer);

  return {
    key,
    url: `/storage/${key}`,
    provider: 'local',
  };
};

const remove = async (key: string): Promise<void> => {
  const filePath = resolvePath(key);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return;
    }

    throw error;
  }
};

const getUrl = async (key: string): Promise<string> => {
  return `/storage/${key}`;
};

const move = async (key: string, folder: string): Promise<string> => {
  if (!key.startsWith('tmp/')) {
    throw BadRequestException('Invalid file key: must be a temporary upload.');
  }

  const sourcePath = resolvePath(key);
  const basename = path.basename(key);
  const destKey = `${folder}/${basename}`;
  const destPath = resolvePath(destKey);

  await ensureDirectory(path.dirname(destPath));
  await fs.rename(sourcePath, destPath);

  return destKey;
};

export const localStorageProvider = {
  upload,
  delete: remove,
  getUrl,
  move,
} as const;
