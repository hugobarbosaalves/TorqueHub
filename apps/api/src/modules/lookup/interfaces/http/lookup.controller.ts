import type { FastifyInstance } from 'fastify';
import { prisma } from '../../../../shared/infrastructure/database/prisma.js';
import { requireRole } from '../../../../shared/infrastructure/auth/role-guard.js';
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
  /** Lista todas as oficinas cadastradas — somente PLATFORM_ADMIN. */
  app.get(
    '/',
    { schema: listWorkshopsSchema, onRequest: [requireRole('PLATFORM_ADMIN')] },
    async (_request, reply) => {
      const workshops = await prisma.workshop.findMany({
        orderBy: { name: 'asc' },
      });
      return reply.send({ success: true, data: workshops });
    },
  );

  /** Lista clientes da oficina do usuário para popular dropdowns. */
  app.get<{ Params: { workshopId: string } }>(
    '/:workshopId/customers',
    {
      schema: listWorkshopCustomersSchema,
      onRequest: [requireRole('WORKSHOP_OWNER', 'MECHANIC', 'PLATFORM_ADMIN')],
    },
    async (request, reply) => {
      const tenantId = request.tenantId ?? request.params.workshopId;
      const customers = await prisma.customer.findMany({
        where: { workshopId: tenantId },
        orderBy: { name: 'asc' },
      });
      return reply.send({ success: true, data: customers });
    },
  );

  /** Lista veículos da oficina do usuário, com filtro opcional por cliente. */
  app.get<{ Params: { workshopId: string }; Querystring: { customerId?: string } }>(
    '/:workshopId/vehicles',
    {
      schema: listWorkshopVehiclesSchema,
      onRequest: [requireRole('WORKSHOP_OWNER', 'MECHANIC', 'PLATFORM_ADMIN')],
    },
    async (request, reply) => {
      const tenantId = request.tenantId ?? request.params.workshopId;
      const where: Record<string, string> = { workshopId: tenantId };
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
