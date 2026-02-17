import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import authPlugin from './shared/infrastructure/auth/auth.plugin.js';
import { authRoutes } from './modules/auth/interfaces/http/auth.controller.js';
import { serviceOrderRoutes } from './modules/service-order/interfaces/http/service-order.controller.js';
import { lookupRoutes } from './modules/lookup/interfaces/http/lookup.controller.js';
import { customerRoutes } from './modules/customer/interfaces/http/customer.controller.js';
import { vehicleRoutes } from './modules/vehicle/interfaces/http/vehicle.controller.js';
import { publicOrderRoutes } from './modules/service-order/interfaces/http/public-order.controller.js';
import { mediaRoutes } from './modules/service-order/interfaces/http/media.controller.js';
import { quotePdfRoutes } from './modules/service-order/interfaces/http/quote-pdf.controller.js';
import { startQuoteExpiryScheduler } from './modules/service-order/application/quote-expiry.scheduler.js';

const IS_PRODUCTION = process.env['NODE_ENV'] === 'production';

/** Origens permitidas para CORS (produção e dev). */
const ALLOWED_ORIGINS = IS_PRODUCTION
  ? [
      'https://torque-hub-web.vercel.app',
      process.env['WEB_URL'] ?? '',
    ].filter(Boolean)
  : true;

/** Builds and configures the Fastify application instance. */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: IS_PRODUCTION
      ? { level: 'info' }
      : { level: 'info', transport: { target: 'pino-pretty', options: { colorize: true } } },
  });

  await app.register(cors, { origin: ALLOWED_ORIGINS, credentials: true });

  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  await app.register(rateLimit, {
    max: IS_PRODUCTION ? 100 : 1000,
    timeWindow: '1 minute',
  });

  await app.register(multipart, { limits: { fileSize: 20 * 1024 * 1024 } });

  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

  await app.register(fastifyStatic, {
    root: uploadsDir,
    prefix: '/uploads/',
    decorateReply: false,
  });

  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'TorqueHub API',
        description: 'REST API for TorqueHub — Automotive Maintenance SaaS',
        version: '0.1.0',
        contact: { name: 'TorqueHub Team' },
      },
      servers: IS_PRODUCTION
        ? [
            {
              url: process.env['RENDER_EXTERNAL_URL'] ?? 'https://torquehub-api.onrender.com',
              description: 'Production',
            },
          ]
        : [{ url: 'http://localhost:3333', description: 'Development' }],
      tags: [
        { name: 'Health', description: 'Health check endpoint' },
        { name: 'Auth', description: 'Authentication — login, register, profile' },
        { name: 'Workshops', description: 'Workshop lookup endpoints' },
        { name: 'Customers', description: 'Customer management CRUD' },
        { name: 'Vehicles', description: 'Vehicle management CRUD' },
        { name: 'Service Orders', description: 'Service order management CRUD' },
        {
          name: 'Public',
          description: 'Endpoints públicos de acesso do cliente (sem autenticação)',
        },
        { name: 'Media', description: 'Upload e gerenciamento de fotos/vídeos' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT token obtained from POST /auth/login',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
  });

  /** Endpoint de verificação de saúde da API. */
  app.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Health check',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
    () => ({ status: 'ok', timestamp: new Date().toISOString() }),
  );

  await app.register(authPlugin);

  /** Routes that do NOT require authentication. */
  const PUBLIC_PREFIXES = ['/health', '/auth/', '/public/', '/docs', '/uploads/'];

  /** Global hook — requires JWT for all routes except public ones. */
  app.addHook('onRequest', async (request, reply) => {
    const isPublic = PUBLIC_PREFIXES.some((prefix) => request.url.startsWith(prefix));
    if (isPublic) return;
    return app.authenticate(request, reply);
  });

  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(lookupRoutes, { prefix: '/workshops' });
  await app.register(serviceOrderRoutes, { prefix: '/service-orders' });
  await app.register(customerRoutes, { prefix: '/customers' });
  await app.register(vehicleRoutes, { prefix: '/vehicles' });
  await app.register(publicOrderRoutes, { prefix: '/public/orders' });
  await app.register(quotePdfRoutes, { prefix: '/public/orders' });
  await app.register(mediaRoutes, { prefix: '/service-orders' });

  startQuoteExpiryScheduler(app.log);

  return app;
}
