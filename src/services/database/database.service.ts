import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client.js';
import { configDatabase } from '@/configs/index.js';

const adapter = new PrismaPg({ connectionString: configDatabase.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export const databaseService = {
  async connect(): Promise<void> {
    await prisma.$connect();
  },

  async disconnect(): Promise<void> {
    await prisma.$disconnect();
  },

  client: prisma,
} as const;
