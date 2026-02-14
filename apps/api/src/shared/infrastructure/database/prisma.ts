import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env['DATABASE_URL'] ?? 'postgresql://torquehub:torquehub123@localhost:5432/torquehub';

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Singleton para evitar múltiplas instâncias do PrismaClient em dev (hot-reload)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}
