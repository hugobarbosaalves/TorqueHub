import type { FastifyInstance } from 'fastify';
import { prisma } from '../../../../shared/infrastructure/database/prisma.js';

/**
 * Rotas de consulta rápida (lookup) para popular formulários no front-end.
 * Retorna workshops, clientes e veículos cadastrados.
 */
export async function lookupRoutes(app: FastifyInstance): Promise<void> {
  // ── GET /workshops ──────────────────────────────────────────────────────
  app.get('/', async (_request, reply) => {
    const workshops = await prisma.workshop.findMany({
      orderBy: { name: 'asc' },
    });
    return reply.send({ success: true, data: workshops });
  });

  // ── GET /workshops/:workshopId/customers ────────────────────────────────
  app.get<{ Params: { workshopId: string } }>(
    '/:workshopId/customers',
    async (request, reply) => {
      const customers = await prisma.customer.findMany({
        where: { workshopId: request.params.workshopId },
        orderBy: { name: 'asc' },
      });
      return reply.send({ success: true, data: customers });
    },
  );

  // ── GET /workshops/:workshopId/vehicles ─────────────────────────────────
  app.get<{ Params: { workshopId: string }; Querystring: { customerId?: string } }>(
    '/:workshopId/vehicles',
    async (request, reply) => {
      const where: Record<string, string> = { workshopId: request.params.workshopId };
      if (request.query.customerId) {
        where['customerId'] = request.query.customerId;
      }
      const vehicles = await prisma.vehicle.findMany({
        where,
        orderBy: { plate: 'asc' },
      });
      return reply.send({ success: true, data: vehicles });
    },
  );
}
