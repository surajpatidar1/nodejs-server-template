import { v2 as cloudinary } from 'cloudinary';
import crypto from 'node:crypto';
import path from 'node:path';
import { configStorage } from '@/configs/index.js';
import { BadRequestException } from '@/utils/exceptions.js';
import type { StorageFile, StorageResult } from '../storage.types.js';

cloudinary.config({
  cloud_name: configStorage.CLOUDINARY.CLOUD_NAME,
  api_key: configStorage.CLOUDINARY.API_KEY,
  api_secret: configStorage.CLOUDINARY.API_SECRET,
});

const upload = async (file: StorageFile): Promise<StorageResult> => {
  const extension = path.extname(file.originalName);
  const publicId = `tmp/${crypto.randomUUID()}${extension}`;

  const result = await new Promise<{
    public_id: string;
    secure_url: string;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error('Cloudinary upload failed'));
          return;
        }

        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
      },
    );

    stream.end(file.buffer);
  });

  return {
    key: result.public_id,
    url: result.secure_url,
    provider: 'cloudinary',
  };
};

const DELETABLE_RESOURCE_TYPES = ['image', 'raw', 'video'] as const;

const remove = async (key: string): Promise<void> => {
  for (const resourceType of DELETABLE_RESOURCE_TYPES) {
    const result = await cloudinary.uploader.destroy(key, {
      resource_type: resourceType,
    });

    if (result.result === 'ok') {
      return;
    }
  }
};

const getUrl = async (key: string): Promise<string> => {
  return cloudinary.url(key, {
    secure: true,
  });
};

const move = async (key: string, folder: string): Promise<string> => {
  if (!key.startsWith('tmp/')) {
    throw BadRequestException('Invalid file key: must be a temporary upload.');
  }

  const newPublicId = `${folder}/${path.basename(key)}`;

  await cloudinary.uploader.rename(key, newPublicId, {
    resource_type: 'auto',
    overwrite: false,
  });

  // Return the public_id (key) so the DB stores a key, not a URL.
  // getUrl() in this provider reconstructs the full URL from the public_id.
  return newPublicId;
};

export const cloudinaryStorageProvider = {
  upload,
  delete: remove,
  getUrl,
  move,
} as const;
