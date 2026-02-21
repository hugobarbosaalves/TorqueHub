import type { FastifyInstance } from 'fastify';
import type {
  CreateVehicleRequest,
  UpdateVehicleRequest,
  ApiResponse,
  VehicleDTO,
} from '@torquehub/contracts';
import { prisma } from '../../../../shared/infrastructure/database/prisma.js';
import { requireRole } from '../../../../shared/infrastructure/auth/role-guard.js';
import { VehicleRepository } from '../../infrastructure/repositories/vehicle.repository.js';
import {
  CreateVehicleUseCase,
  ListVehiclesUseCase,
  GetVehicleUseCase,
} from '../../application/use-cases/vehicle.use-cases.js';
import {
  createVehicleSchema,
  listVehiclesSchema,
  getVehicleSchema,
  updateVehicleSchema,
  deleteVehicleSchema,
} from './vehicle.schemas.js';

const repo = new VehicleRepository(prisma);
const createUseCase = new CreateVehicleUseCase(repo);
const listUseCase = new ListVehiclesUseCase(repo);
const getUseCase = new GetVehicleUseCase(repo);

/** Registers all vehicle CRUD HTTP routes. */
export function vehicleRoutes(app: FastifyInstance): void {
  /** Cadastra um novo veículo vinculado à oficina do usuário. */
  app.post<{
    Body: CreateVehicleRequest;
    Reply: ApiResponse<VehicleDTO>;
  }>(
    '/',
    { schema: createVehicleSchema, onRequest: [requireRole('WORKSHOP_OWNER', 'PLATFORM_ADMIN')] },
    async (request, reply) => {
      const tenantId = request.tenantId;
      if (!tenantId) {
        return reply.status(400).send({
          success: false,
          data: undefined as never,
          meta: { error: 'workshopId is required' },
        });
      }

      const { customerId, plate, brand, model } = request.body;
      if (!customerId || !plate || !brand || !model) {
        return reply.status(400).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Missing required fields: customerId, plate, brand, model' },
        });
      }

      const result = await createUseCase.execute({ ...request.body, workshopId: tenantId });
      return reply.status(201).send({ success: true, data: result });
    },
  );

  /** Lista veículos filtrados por oficina ou cliente. */
  app.get<{
    Querystring: { customerId?: string };
    Reply: ApiResponse<VehicleDTO[]>;
  }>(
    '/',
    {
      schema: listVehiclesSchema,
      onRequest: [requireRole('WORKSHOP_OWNER', 'MECHANIC', 'PLATFORM_ADMIN')],
    },
    async (request, reply) => {
      const tenantId = request.tenantId;
      const { customerId } = request.query;

      if (!tenantId && !customerId) {
        return reply.status(400).send({
          success: false,
          data: undefined as never,
          meta: { error: 'workshopId is required' },
        });
      }

      const vehicles = customerId
        ? await listUseCase.executeByCustomer(customerId)
        : await listUseCase.executeByWorkshop(tenantId ?? '');

      return reply.send({
        success: true,
        data: vehicles,
        meta: { total: vehicles.length },
      });
    },
  );

  /** Busca um veículo específico pelo ID. Retorna 404 se não encontrado. */
  app.get<{
    Params: { id: string };
    Reply: ApiResponse<VehicleDTO>;
  }>(
    '/:id',
    {
      schema: getVehicleSchema,
      onRequest: [requireRole('WORKSHOP_OWNER', 'MECHANIC', 'PLATFORM_ADMIN')],
    },
    async (request, reply) => {
      const vehicle = await getUseCase.execute(request.params.id);

      if (!vehicle) {
        return reply.status(404).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Vehicle not found' },
        });
      }

      return reply.send({ success: true, data: vehicle });
    },
  );

  /** Atualiza dados de um veículo existente. Retorna 404 se não encontrado. */
  app.put<{
    Params: { id: string };
    Body: UpdateVehicleRequest;
    Reply: ApiResponse<VehicleDTO>;
  }>(
    '/:id',
    { schema: updateVehicleSchema, onRequest: [requireRole('WORKSHOP_OWNER', 'PLATFORM_ADMIN')] },
    async (request, reply) => {
      try {
        const updated = await repo.update(request.params.id, request.body);
        return await reply.send({
          success: true,
          data: {
            id: updated.id,
            workshopId: updated.workshopId,
            customerId: updated.customerId,
            plate: updated.plate,
            brand: updated.brand,
            model: updated.model,
            year: updated.year,
            color: updated.color,
            mileage: updated.mileage,
            customerName: updated.customer?.name ?? null,
            createdAt: updated.createdAt.toISOString(),
            updatedAt: updated.updatedAt.toISOString(),
          },
        });
      } catch {
        return reply.status(404).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Vehicle not found' },
        });
      }
    },
  );

  /** Remove um veículo pelo ID. Retorna 404 se não encontrado. */
  app.delete<{
    Params: { id: string };
    Reply: ApiResponse<{ deleted: boolean }>;
  }>(
    '/:id',
    { schema: deleteVehicleSchema, onRequest: [requireRole('WORKSHOP_OWNER', 'PLATFORM_ADMIN')] },
    async (request, reply) => {
      try {
        await repo.delete(request.params.id);
        return await reply.send({ success: true, data: { deleted: true } });
      } catch {
        return reply.status(404).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Vehicle not found' },
        });
      }
    },
  );
}
