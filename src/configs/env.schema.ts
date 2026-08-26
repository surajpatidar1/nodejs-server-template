import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(7001),
    LOG_LEVEL: z.string().default('info'),
    APP_NAME: z.string().default('Node server'),

    DATABASE_URL: z
      .string()
      .min(
        1,
        'DATABASE_URL is required (e.g. postgresql://user:pass@host:5432/db)',
      ),

    ACCESS_TOKEN_SECRET: z
      .string()
      .min(32, 'ACCESS_TOKEN_SECRET must be at least 32 characters'),
    REFRESH_TOKEN_SECRET: z
      .string()
      .min(32, 'REFRESH_TOKEN_SECRET must be at least 32 characters'),

    ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be a valid email'),
    ADMIN_PASSWORD_SALT: z.string().min(1, 'ADMIN_PASSWORD_SALT is required'),
    ADMIN_PASSWORD_HASH: z.string().min(1, 'ADMIN_PASSWORD_HASH is required'),

    SALT_LENGTH: z.coerce.number().int().positive().default(16),
    KEY_LENGTH: z.coerce.number().int().positive().default(64),

    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().int().positive().default(6379),
    REDIS_PASSWORD: z.string().optional(),

    QUEUE_CONCURRENCY: z.coerce.number().int().positive().default(5),
    QUEUE_ATTEMPTS: z.coerce.number().int().positive().default(3),
    QUEUE_BACKOFF_DELAY: z.coerce.number().int().positive().default(1000),

    MAIL_HOST: z.string().optional(),
    MAIL_PORT: z.coerce.number().int().positive().default(587),
    MAIL_USER: z.string().optional(),
    MAIL_PASSWORD: z.string().optional(),
    MAIL_FROM: z.string().optional(),

    OAUTH_GOOGLE_CLIENT_ID: z.string().optional(),
    OAUTH_GOOGLE_CLIENT_SECRET: z.string().optional(),
    OAUTH_GOOGLE_CALLBACK_URL: z.string().url().optional(),

    STORAGE_PROVIDER: z.enum(['local', 's3', 'cloudinary']).default('local'),
    STORAGE_LOCAL_DESTINATION: z.string().default('storage'),
    STORAGE_LOCAL_TEMP_DESTINATION: z.string().default('storage/tmp'),
    STORAGE_MAX_FILE_SIZE: z.coerce
      .number()
      .int()
      .positive()
      .default(5 * 1024 * 1024),

    STORAGE_S3_ENDPOINT: z.string().optional(),
    STORAGE_S3_REGION: z.string().default('auto'),
    STORAGE_S3_BUCKET: z.string().optional(),
    STORAGE_S3_ACCESS_KEY: z.string().optional(),
    STORAGE_S3_SECRET_KEY: z.string().optional(),

    STORAGE_CLOUDINARY_CLOUD_NAME: z.string().optional(),
    STORAGE_CLOUDINARY_API_KEY: z.string().optional(),
    STORAGE_CLOUDINARY_API_SECRET: z.string().optional(),
  })

  .superRefine((env, ctx) => {
    if (env.STORAGE_PROVIDER === 's3') {
      const required = [
        'STORAGE_S3_BUCKET',
        'STORAGE_S3_ACCESS_KEY',
        'STORAGE_S3_SECRET_KEY',
      ] as const;
      for (const key of required) {
        if (!env[key]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: `${key} is required when STORAGE_PROVIDER=s3`,
          });
        }
      }
    }

    if (env.STORAGE_PROVIDER === 'cloudinary') {
      const required = [
        'STORAGE_CLOUDINARY_CLOUD_NAME',
        'STORAGE_CLOUDINARY_API_KEY',
        'STORAGE_CLOUDINARY_API_SECRET',
      ] as const;
      for (const key of required) {
        if (!env[key]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: `${key} is required when STORAGE_PROVIDER=cloudinary`,
          });
        }
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n Invalid environment configuration:\n');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  console.error('\nFix the variable(s) above in your .env file and restart.\n');
  process.exit(1);
}

export const env = parsed.data;
