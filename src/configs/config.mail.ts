export const configMail = {
  HOST: process.env.MAIL_HOST!,
  PORT: Number(process.env.MAIL_PORT ?? 587),
  USER: process.env.MAIL_USER!,
  PASSWORD: process.env.MAIL_PASSWORD!,
  FROM: process.env.MAIL_FROM!,
} as const;