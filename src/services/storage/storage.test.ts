import fs from 'node:fs/promises';

import { storageService } from './storage.service.js';

const test = async (): Promise<void> => {
  const file = {
    buffer: Buffer.from(
      'Storage service test file',
      'utf-8',
    ),
    originalName: 'storage-test.txt',
    mimeType: 'text/plain',
    size: Buffer.byteLength(
      'Storage service test file',
    ),
  };

  console.log(
    `Testing storage provider: ${process.env.STORAGE_PROVIDER}`,
  );

  const result = await storageService.upload(file);

  console.log('Upload successful:');
  console.log(result);

  const url = await storageService.getUrl(
    result.key,
  );

  console.log('URL:');
  console.log(url);

  await storageService.delete(result.key);

  console.log('Delete successful');
};

test().catch((error) => {
  console.error('Storage test failed:', error);
  process.exit(1);
});