import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { serviceOrderRoutes } from './modules/service-order/interfaces/http/service-order.controller.js';
import { lookupRoutes } from './modules/lookup/interfaces/http/lookup.controller.js';
import { customerRoutes } from './modules/customer/interfaces/http/customer.controller.js';
import { vehicleRoutes } from './modules/vehicle/interfaces/http/vehicle.controller.js';
import { publicOrderRoutes } from './modules/service-order/interfaces/http/public-order.controller.js';

/** Builds and configures the Fastify application instance. */
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

  await app.register(cors, { origin: true });

  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'TorqueHub API',
        description: 'REST API for TorqueHub — Automotive Maintenance SaaS',
        version: '0.1.0',
        contact: { name: 'TorqueHub Team' },
      },
      servers: [{ url: 'http://localhost:3333', description: 'Development' }],
      tags: [
        { name: 'Health', description: 'Health check endpoint' },
        { name: 'Workshops', description: 'Workshop lookup endpoints' },
        { name: 'Customers', description: 'Customer management CRUD' },
        { name: 'Vehicles', description: 'Vehicle management CRUD' },
        { name: 'Service Orders', description: 'Service order management CRUD' },
        { name: 'Public', description: 'Endpoints públicos de acesso do cliente (sem autenticação)' },
      ],
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
    async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    },
  );

  await app.register(lookupRoutes, { prefix: '/workshops' });
  await app.register(serviceOrderRoutes, { prefix: '/service-orders' });
  await app.register(customerRoutes, { prefix: '/customers' });
  await app.register(vehicleRoutes, { prefix: '/vehicles' });
  await app.register(publicOrderRoutes, { prefix: '/public/orders' });

  return app;
}
