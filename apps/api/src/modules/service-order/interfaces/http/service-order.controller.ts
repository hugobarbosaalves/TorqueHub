import type { FastifyInstance } from 'fastify';
import type {
  CreateServiceOrderRequest,
  UpdateServiceOrderRequest,
  ApiResponse,
  CreateServiceOrderResponse,
  ServiceOrderDTO,
} from '@torquehub/contracts';
import { ORDER_STATUS_VALUES } from '@torquehub/contracts';
import { prisma } from '../../../../shared/infrastructure/database/prisma.js';
import { requireRole } from '../../../../shared/infrastructure/auth/role-guard.js';
import { ServiceOrderRepository } from '../../infrastructure/repositories/service-order.repository.js';
import { CreateServiceOrderUseCase } from '../../application/use-cases/create-service-order.use-case.js';
import {
  ListServiceOrdersUseCase,
  GetServiceOrderUseCase,
} from '../../application/use-cases/list-service-orders.use-case.js';
import {
  UpdateServiceOrderUseCase,
  NotFoundError,
  ForbiddenStatusError,
} from '../../application/use-cases/update-service-order.use-case.js';
import {
  createOrderSchema,
  listOrdersSchema,
  getOrderSchema,
  updateStatusSchema,
  deleteOrderSchema,
  updateOrderSchema,
} from './service-order.schemas.js';

const repo = new ServiceOrderRepository(prisma);
const createUseCase = new CreateServiceOrderUseCase(repo);
const listUseCase = new ListServiceOrdersUseCase(repo);
const getUseCase = new GetServiceOrderUseCase(repo);
const updateUseCase = new UpdateServiceOrderUseCase(repo);

/** Registers all service order HTTP routes. */
export function serviceOrderRoutes(app: FastifyInstance): void {
  /** Cria uma nova ordem de serviço com itens. Requer ao menos 1 item. */
  app.post<{
    Body: CreateServiceOrderRequest;
    Reply: ApiResponse<CreateServiceOrderResponse>;
  }>(
    '/',
    { schema: createOrderSchema, onRequest: [requireRole('WORKSHOP_OWNER', 'PLATFORM_ADMIN')] },
    async (request, reply) => {
      const tenantId = request.tenantId;
      if (!tenantId) {
        return reply.status(400).send({
          success: false,
          data: undefined as never,
          meta: { error: 'workshopId is required' },
        });
      }

      const body = request.body;

      if (!body.customerId || !body.vehicleId || !body.description) {
        return reply.status(400).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Missing required fields: customerId, vehicleId, description' },
        });
      }

      if (body.items.length === 0) {
        return reply.status(400).send({
          success: false,
          data: undefined as never,
          meta: { error: 'At least one item is required' },
        });
      }

      const result = await createUseCase.execute({ ...body, workshopId: tenantId });

      return reply.status(201).send({
        success: true,
        data: result,
      });
    },
  );

  /** Lista ordens de serviço da oficina do usuário autenticado. */
  app.get<{
    Querystring: { workshopId?: string };
    Reply: ApiResponse<ServiceOrderDTO[]>;
  }>(
    '/',
    {
      schema: listOrdersSchema,
      onRequest: [requireRole('WORKSHOP_OWNER', 'MECHANIC', 'PLATFORM_ADMIN')],
    },
    async (request, reply) => {
      const tenantId = request.tenantId;
      const orders = await listUseCase.execute(tenantId ?? undefined);

      return reply.send({
        success: true,
        data: orders,
        meta: { total: orders.length },
      });
    },
  );

  /** Busca uma ordem de serviço pelo ID, incluindo itens. */
  app.get<{
    Params: { id: string };
    Reply: ApiResponse<ServiceOrderDTO>;
  }>(
    '/:id',
    {
      schema: getOrderSchema,
      onRequest: [requireRole('WORKSHOP_OWNER', 'MECHANIC', 'PLATFORM_ADMIN')],
    },
    async (request, reply) => {
      const order = await getUseCase.execute(request.params.id);

      if (!order) {
        return reply.status(404).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Service order not found' },
        });
      }

      return reply.send({
        success: true,
        data: order,
      });
    },
  );

  /** Atualiza uma ordem DRAFT (descrição, observações, itens). */
  app.put<{
    Params: { id: string };
    Body: UpdateServiceOrderRequest;
    Reply: ApiResponse<ServiceOrderDTO>;
  }>(
    '/:id',
    { schema: updateOrderSchema, onRequest: [requireRole('WORKSHOP_OWNER', 'PLATFORM_ADMIN')] },
    async (request, reply) => {
      try {
        const result = await updateUseCase.execute(request.params.id, request.body);
        return await reply.send({ success: true, data: result });
      } catch (error) {
        if (error instanceof NotFoundError) {
          return reply.status(404).send({
            success: false,
            data: undefined as never,
            meta: { error: error.message },
          });
        }
        if (error instanceof ForbiddenStatusError) {
          return reply.status(403).send({
            success: false,
            data: undefined as never,
            meta: { error: error.message },
          });
        }
        throw error;
      }
    },
  );

  /** Atualiza o status de uma ordem. Valida contra a lista de status permitidos. */
  app.patch<{
    Params: { id: string };
    Body: { status: string };
    Reply: ApiResponse<{ id: string; status: string }>;
  }>(
    '/:id/status',
    { schema: updateStatusSchema, onRequest: [requireRole('WORKSHOP_OWNER', 'PLATFORM_ADMIN')] },
    async (request, reply) => {
      const { id } = request.params;
      const { status } = request.body;

      if (!ORDER_STATUS_VALUES.includes(status as (typeof ORDER_STATUS_VALUES)[number])) {
        return reply.status(400).send({
          success: false,
          data: undefined as never,
          meta: { error: `Invalid status. Must be one of: ${ORDER_STATUS_VALUES.join(', ')}` },
        });
      }

      try {
        const updated = await repo.updateStatus(id, status);
        return await reply.send({
          success: true,
          data: { id: updated.id, status: updated.status },
        });
      } catch {
        return reply.status(404).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Service order not found' },
        });
      }
    },
  );

  /** Remove uma ordem de serviço pelo ID. Retorna 404 se não encontrada. */
  app.delete<{
    Params: { id: string };
    Reply: ApiResponse<{ deleted: boolean }>;
  }>(
    '/:id',
    { schema: deleteOrderSchema, onRequest: [requireRole('WORKSHOP_OWNER', 'PLATFORM_ADMIN')] },
    async (request, reply) => {
      try {
        await repo.delete(request.params.id);
        return await reply.send({
          success: true,
          data: { deleted: true },
        });
      } catch {
        return reply.status(404).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Service order not found' },
        });
      }
    },
  );
}
