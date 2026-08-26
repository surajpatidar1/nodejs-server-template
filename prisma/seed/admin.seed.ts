import { Prisma } from '../../src/generated/prisma/client.js';
import { configAdmin } from '../../src/configs/index.js';

export const admin: Prisma.UserCreateInput = {
  firstname: configAdmin.firstname,
  lastname: configAdmin.lastname,
  email: configAdmin.email,
  meta: {
    create: {
      passwordSalt: configAdmin.passwordSalt,
      passwordHash: configAdmin.passwordHash,
    },
  },
};
