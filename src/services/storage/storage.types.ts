export interface StorageFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface StorageResult {
  key: string;
  url: string;
  provider: string;
}