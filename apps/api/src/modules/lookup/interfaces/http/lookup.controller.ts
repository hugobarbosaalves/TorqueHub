import type { FastifyInstance } from 'fastify';
import { prisma } from '../../../../shared/infrastructure/database/prisma.js';
import {
  listWorkshopsSchema,
  listWorkshopCustomersSchema,
  listWorkshopVehiclesSchema,
} from './lookup.schemas.js';

/**
 * Lookup routes for populating front-end dropdowns.
 * Returns workshops, customers, and vehicles.
 */
export function lookupRoutes(app: FastifyInstance): void {
  // ── GET /workshops ──────────────────────────────────────────────────────
  app.get('/', { schema: listWorkshopsSchema }, async (_request, reply) => {
    const workshops = await prisma.workshop.findMany({
      orderBy: { name: 'asc' },
    });
    return reply.send({ success: true, data: workshops });
  });

  // ── GET /workshops/:workshopId/customers ────────────────────────────────
  app.get<{ Params: { workshopId: string } }>(
    '/:workshopId/customers',
    { schema: listWorkshopCustomersSchema },
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
    { schema: listWorkshopVehiclesSchema },
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
