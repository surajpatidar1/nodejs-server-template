import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from "@/generated/prisma/client.js";
import { configDatabase } from '@/configs/index.js';
import {logger} from "@/utils/index.js";

const adapter = new PrismaPg({ connectionString: configDatabase.DATABASE_URL });
const prisma = new PrismaClient({ adapter })

export const databaseService = {
  async connect(): Promise<void> {
    await prisma.$connect();
    logger.info('Database connected successfully');
  },

  async disconnect(): Promise<void> {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  },

  client: prisma,
} as const;

