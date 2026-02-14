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
    app.log.info(`🚗 TorqueHub API running on http://${HOST}:${String(PORT)}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

/** Graceful shutdown — disconnects from the database before exiting. */
function gracefulShutdown(): void {
  void prisma.$disconnect().then(() => process.exit(0));
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

await main();
