export const configPassword = {
  SALT_LENGTH: Number(process.env.SALT_LENGTH) ?? 16,
  KEY_LENGTH: Number(process.env.KEY_LENGTH) ?? 64,
} as const;
