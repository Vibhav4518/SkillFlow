import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '@prisma/client';
import { env } from '../../../config/env.config.js';

const isAccelerate =
  env.DATABASE_URL.startsWith('prisma://') ||
  env.DATABASE_URL.startsWith('prisma+postgres://');

const clientOptions: Prisma.PrismaClientOptions = {
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
};

if (!isAccelerate) {
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  (clientOptions as any).adapter = adapter;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient(clientOptions);

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
