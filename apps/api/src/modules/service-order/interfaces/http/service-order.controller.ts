import type { FastifyInstance } from 'fastify';
import type {
  CreateServiceOrderRequest,
  ApiResponse,
  CreateServiceOrderResponse,
  ServiceOrderDTO,
} from '@torquehub/contracts';
import { prisma } from '../../../../shared/infrastructure/database/prisma.js';
import { ServiceOrderRepository } from '../../infrastructure/repositories/service-order.repository.js';
import { CreateServiceOrderUseCase } from '../../application/use-cases/create-service-order.use-case.js';
import { ListServiceOrdersUseCase, GetServiceOrderUseCase } from '../../application/use-cases/list-service-orders.use-case.js';

const repo = new ServiceOrderRepository(prisma);
const createUseCase = new CreateServiceOrderUseCase(repo);
const listUseCase = new ListServiceOrdersUseCase(repo);
const getUseCase = new GetServiceOrderUseCase(repo);

export async function serviceOrderRoutes(app: FastifyInstance): Promise<void> {
  // ── POST / — Criar ordem de serviço ─────────────────────────────────────
  app.post<{
    Body: CreateServiceOrderRequest;
    Reply: ApiResponse<CreateServiceOrderResponse>;
  }>('/', async (request, reply) => {
    const body = request.body;

    if (!body.workshopId || !body.customerId || !body.vehicleId || !body.description) {
      return reply.status(400).send({
        success: false,
        data: undefined as never,
        meta: { error: 'Missing required fields: workshopId, customerId, vehicleId, description' },
      });
    }

    if (!body.items || body.items.length === 0) {
      return reply.status(400).send({
        success: false,
        data: undefined as never,
        meta: { error: 'At least one item is required' },
      });
    }

    const result = await createUseCase.execute(body);

    return reply.status(201).send({
      success: true,
      data: result,
    });
  });

  // ── GET / — Listar ordens de serviço ────────────────────────────────────
  app.get<{
    Querystring: { workshopId?: string };
    Reply: ApiResponse<ServiceOrderDTO[]>;
  }>('/', async (request, reply) => {
    const { workshopId } = request.query;
    const orders = await listUseCase.execute(workshopId);

    return reply.send({
      success: true,
      data: orders,
      meta: { total: orders.length },
    });
  });

  // ── GET /:id — Buscar ordem por ID ──────────────────────────────────────
  app.get<{
    Params: { id: string };
    Reply: ApiResponse<ServiceOrderDTO>;
  }>('/:id', async (request, reply) => {
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
  });

  // ── PATCH /:id/status — Atualizar status ────────────────────────────────
  app.patch<{
    Params: { id: string };
    Body: { status: string };
    Reply: ApiResponse<{ id: string; status: string }>;
  }>('/:id/status', async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body;

    const validStatuses = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return reply.status(400).send({
        success: false,
        data: undefined as never,
        meta: { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
      });
    }

    try {
      const updated = await repo.updateStatus(id, status);
      return reply.send({
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
  });

  // ── DELETE /:id — Deletar ordem ─────────────────────────────────────────
  app.delete<{
    Params: { id: string };
    Reply: ApiResponse<{ deleted: boolean }>;
  }>('/:id', async (request, reply) => {
    try {
      await repo.delete(request.params.id);
      return reply.send({
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
  });
}
