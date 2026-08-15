export const configAdmin = {
  firstname: 'admin',
  lastname: 'admin',
  username: 'admin',
  email: process.env.ADMIN_EMAIL,
  passwordSalt: process.env.ADMIN_PASSWORD_SALT,
  passwordHash: process.env.ADMIN_PASSWORD_HASH,
  filePath: 'admin/profile',
} as const;
