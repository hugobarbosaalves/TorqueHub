/**
 * Prisma client singleton with PostgreSQL adapter.
 * Uses `@prisma/adapter-pg` for connection pooling.
 * Ensures single instance across hot-reloads in development.
 * @module database
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env['DATABASE_URL'];
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

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
