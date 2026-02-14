import 'dotenv/config';
import { buildApp } from './app.js';
import { prisma } from './shared/infrastructure/database/prisma.js';

const PORT = Number(process.env['PORT'] ?? 3333);
const HOST = process.env['HOST'] ?? '0.0.0.0';

async function main(): Promise<void> {
  const app = await buildApp();

  try {
    // Testa conexão com o banco
    await prisma.$connect();
    app.log.info('🗄️  Database connected');

    await app.listen({ port: PORT, host: HOST });
    app.log.info(`🚗 TorqueHub API running on http://${HOST}:${PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

main();
