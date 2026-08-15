import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import crypto from 'node:crypto';
import path from 'node:path';
import { configStorage } from '@/configs/index.js';

import type { StorageFile, StorageResult } from '../storage.types.js';

const s3Client = new S3Client({
  region: configStorage.S3.REGION,
  endpoint: configStorage.S3.ENDPOINT || undefined,
  ...(configStorage.S3.ACCESS_KEY && configStorage.S3.SECRET_KEY
    ? {
        credentials: {
          accessKeyId: configStorage.S3.ACCESS_KEY,
          secretAccessKey: configStorage.S3.SECRET_KEY,
        },
      }
    : {}),
});

const upload = async (file: StorageFile): Promise<StorageResult> => {
  const extension = path.extname(file.originalName);

  const key = `${crypto.randomUUID()}${extension}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: configStorage.S3.BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimeType,
    }),
  );

  const url = configStorage.S3.ENDPOINT
    ? `${configStorage.S3.ENDPOINT}/${configStorage.S3.BUCKET}/${key}`
    : `https://${configStorage.S3.BUCKET}.s3.${configStorage.S3.REGION}.amazonaws.com/${key}`;

  return {
    key,
    url,
    provider: 's3',
  };
};

const remove = async (key: string): Promise<void> => {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: configStorage.S3.BUCKET,
      Key: key,
    }),
  );
};

const getUrl = async (key: string): Promise<string> => {
  if (configStorage.S3.ENDPOINT) {
    return `${configStorage.S3.ENDPOINT}/${configStorage.S3.BUCKET}/${key}`;
  }

  return `https://${configStorage.S3.BUCKET}.s3.${configStorage.S3.REGION}.amazonaws.com/${key}`;
};

const move = async (filename: string, folder: string): Promise<string> => {
  const newKey = `${folder}/${filename}`;

  await s3Client.send(
    new CopyObjectCommand({
      Bucket: configStorage.S3.BUCKET,
      CopySource: `${configStorage.S3.BUCKET}/${filename}`,
      Key: newKey,
    }),
  );

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: configStorage.S3.BUCKET,
      Key: filename,
    }),
  );

  return newKey;
};

export const s3StorageProvider = {
  upload,
  delete: remove,
  getUrl,
  move,
} as const;
