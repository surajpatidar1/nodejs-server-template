import type { StorageFile, StorageResult } from './storage.types.js';

export interface StorageProvider {
  upload(file: StorageFile): Promise<StorageResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string): Promise<string>;
  move(key: string, folder: string): Promise<string>;
}
