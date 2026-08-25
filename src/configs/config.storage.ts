export const configStorage = {
  PROVIDER: process.env.STORAGE_PROVIDER ?? 'local',

  LOCAL: {
    DESTINATION: process.env.STORAGE_LOCAL_DESTINATION ?? 'storage',
    TEMP_DESTINATION:
      process.env.STORAGE_LOCAL_TEMP_DESTINATION ?? 'storage/tmp',
  },

  S3: {
    ENDPOINT: process.env.STORAGE_S3_ENDPOINT,
    REGION: process.env.STORAGE_S3_REGION ?? 'auto',
    BUCKET: process.env.STORAGE_S3_BUCKET,
    ACCESS_KEY: process.env.STORAGE_S3_ACCESS_KEY,
    SECRET_KEY: process.env.STORAGE_S3_SECRET_KEY,
  },

  CLOUDINARY: {
    CLOUD_NAME: process.env.STORAGE_CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.STORAGE_CLOUDINARY_API_KEY,
    API_SECRET: process.env.STORAGE_CLOUDINARY_API_SECRET,
  },

  MAX_FILE_SIZE: Number(process.env.STORAGE_MAX_FILE_SIZE ?? 5 * 1024 * 1024),

  ALLOWED_MIMETYPES: [
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/pdf',
  ],
} as const;
