import Fastify from 'fastify';
import cors from '@fastify/cors';
import { serviceOrderRoutes } from './modules/service-order/interfaces/http/service-order.controller.js';
import { lookupRoutes } from './modules/lookup/interfaces/http/lookup.controller.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: { colorize: true },
      },
    },
  });

  // ── Plugins ───────────────────────────────────────────────────────────────
  await app.register(cors, { origin: true });

  // ── Health Check ──────────────────────────────────────────────────────────
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // ── Module Routes ─────────────────────────────────────────────────────────
  await app.register(lookupRoutes, { prefix: '/workshops' });
  await app.register(serviceOrderRoutes, { prefix: '/service-orders' });

  return app;
}
