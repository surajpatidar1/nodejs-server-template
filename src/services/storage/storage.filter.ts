import type { FileFilterCallback } from 'multer';
import type { Request } from 'express';

const allowedMimeTypes = new Set([
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',

  // Documents
  'application/pdf',
  'text/plain',

  // Word
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

  // Excel
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

  // PowerPoint
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);


export const storageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
): void => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(
      new Error(
        `Unsupported file type: ${file.mimetype}`,
      ),
    );

    return;
  }

  callback(null, true);
};