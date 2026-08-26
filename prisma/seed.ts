import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { configDatabase } from '../src/configs/index.js';
import { admin } from './seed/index.js';

const adapter = new PrismaPg({
  connectionString: configDatabase.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function seedAdmin() {
  const existingAdmin = await prisma.admin.findFirst();

  if (existingAdmin) {
    console.log('[WARN] Admin already exists, skipping admin seed');
    return;
  }

  const passwordHash = admin.meta?.create?.passwordHash;
  const passwordSalt = admin.meta?.create?.passwordSalt;

  if (!admin.email || !passwordHash || !passwordSalt) {
    throw new Error('Invalid default admin credentials found');
  }

  await prisma.admin.create({
    data: {
      firstname: admin.firstname,
      lastname: admin.lastname,
      email: admin.email,
      meta: {
        create: {
          passwordHash,
          passwordSalt,
        },
      },
    },
  });

  console.log(`[DONE] Admin seeded successfully: ${admin.email}`);
}

async function main() {
  await seedAdmin();
}

main()
  .catch((error) => {
    console.error('[ERROR] Admin seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
