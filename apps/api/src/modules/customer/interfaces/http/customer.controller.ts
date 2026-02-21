import type { FastifyInstance } from 'fastify';
import type {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  ApiResponse,
  CustomerDTO,
} from '@torquehub/contracts';
import { prisma } from '../../../../shared/infrastructure/database/prisma.js';
import { requireRole } from '../../../../shared/infrastructure/auth/role-guard.js';
import { CustomerRepository } from '../../infrastructure/repositories/customer.repository.js';
import {
  CreateCustomerUseCase,
  ListCustomersUseCase,
  GetCustomerUseCase,
} from '../../application/use-cases/customer.use-cases.js';
import {
  createCustomerSchema,
  listCustomersSchema,
  getCustomerSchema,
  updateCustomerSchema,
  deleteCustomerSchema,
} from './customer.schemas.js';

const repo = new CustomerRepository(prisma);
const createUseCase = new CreateCustomerUseCase(repo);
const listUseCase = new ListCustomersUseCase(repo);
const getUseCase = new GetCustomerUseCase(repo);

/** Registers all customer CRUD HTTP routes. */
export function customerRoutes(app: FastifyInstance): void {
  /** Cria um novo cliente vinculado à oficina do usuário. */
  app.post<{
    Body: CreateCustomerRequest;
    Reply: ApiResponse<CustomerDTO>;
  }>(
    '/',
    { schema: createCustomerSchema, onRequest: [requireRole('WORKSHOP_OWNER', 'PLATFORM_ADMIN')] },
    async (request, reply) => {
      const tenantId = request.tenantId;
      if (!tenantId) {
        return reply.status(400).send({
          success: false,
          data: undefined as never,
          meta: { error: 'workshopId is required' },
        });
      }

      const { name } = request.body;
      if (!name) {
        return reply.status(400).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Missing required field: name' },
        });
      }

      const result = await createUseCase.execute({ ...request.body, workshopId: tenantId });
      return reply.status(201).send({ success: true, data: result });
    },
  );

  /** Lista todos os clientes da oficina do usuário. */
  app.get<{
    Querystring: { workshopId?: string };
    Reply: ApiResponse<CustomerDTO[]>;
  }>(
    '/',
    {
      schema: listCustomersSchema,
      onRequest: [requireRole('WORKSHOP_OWNER', 'MECHANIC', 'PLATFORM_ADMIN')],
    },
    async (request, reply) => {
      const tenantId = request.tenantId;
      if (!tenantId) {
        return reply.status(400).send({
          success: false,
          data: undefined as never,
          meta: { error: 'workshopId is required' },
        });
      }

      const customers = await listUseCase.execute(tenantId);
      return reply.send({
        success: true,
        data: customers,
        meta: { total: customers.length },
      });
    },
  );

  /** Busca um cliente específico pelo ID. Retorna 404 se não encontrado. */
  app.get<{
    Params: { id: string };
    Reply: ApiResponse<CustomerDTO>;
  }>(
    '/:id',
    {
      schema: getCustomerSchema,
      onRequest: [requireRole('WORKSHOP_OWNER', 'MECHANIC', 'PLATFORM_ADMIN')],
    },
    async (request, reply) => {
      const customer = await getUseCase.execute(request.params.id);

      if (!customer) {
        return reply.status(404).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Customer not found' },
        });
      }

      return reply.send({ success: true, data: customer });
    },
  );

  /** Atualiza dados de um cliente existente. Retorna 404 se não encontrado. */
  app.put<{
    Params: { id: string };
    Body: UpdateCustomerRequest;
    Reply: ApiResponse<CustomerDTO>;
  }>(
    '/:id',
    { schema: updateCustomerSchema, onRequest: [requireRole('WORKSHOP_OWNER', 'PLATFORM_ADMIN')] },
    async (request, reply) => {
      try {
        const updated = await repo.update(request.params.id, request.body);
        return await reply.send({
          success: true,
          data: {
            id: updated.id,
            workshopId: updated.workshopId,
            name: updated.name,
            document: updated.document,
            phone: updated.phone,
            email: updated.email,
            createdAt: updated.createdAt.toISOString(),
            updatedAt: updated.updatedAt.toISOString(),
          },
        });
      } catch {
        return reply.status(404).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Customer not found' },
        });
      }
    },
  );

  /** Remove um cliente pelo ID. Retorna 404 se não encontrado. */
  app.delete<{
    Params: { id: string };
    Reply: ApiResponse<{ deleted: boolean }>;
  }>(
    '/:id',
    { schema: deleteCustomerSchema, onRequest: [requireRole('WORKSHOP_OWNER', 'PLATFORM_ADMIN')] },
    async (request, reply) => {
      try {
        await repo.delete(request.params.id);
        return await reply.send({ success: true, data: { deleted: true } });
      } catch {
        return reply.status(404).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Customer not found' },
        });
      }
    },
  );
}
