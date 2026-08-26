export const configOAuth = {
  GOOGLE: {
    CLIENT_ID: process.env.OAUTH_GOOGLE_CLIENT_ID ?? '',
    CLIENT_SECRET: process.env.OAUTH_GOOGLE_CLIENT_SECRET ?? '',
    CALLBACK_URL:
      process.env.OAUTH_GOOGLE_CALLBACK_URL ??
      'http://localhost:7001/api/auth/google/callback',
  },
} as const;
