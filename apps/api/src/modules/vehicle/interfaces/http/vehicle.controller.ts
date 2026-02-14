import type { FastifyInstance } from 'fastify';
import type {
  CreateVehicleRequest,
  UpdateVehicleRequest,
  ApiResponse,
  VehicleDTO,
} from '@torquehub/contracts';
import { prisma } from '../../../../shared/infrastructure/database/prisma.js';
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
  app.post<{
    Body: CreateVehicleRequest;
    Reply: ApiResponse<VehicleDTO>;
  }>('/', { schema: createVehicleSchema }, async (request, reply) => {
    const { workshopId, customerId, plate, brand, model } = request.body;

    if (!workshopId || !customerId || !plate || !brand || !model) {
      return reply.status(400).send({
        success: false,
        data: undefined as never,
        meta: { error: 'Missing required fields: workshopId, customerId, plate, brand, model' },
      });
    }

    const result = await createUseCase.execute(request.body);
    return reply.status(201).send({ success: true, data: result });
  });

  // ── GET / — Listar veículos (por workshopId ou customerId) ──────────────
  app.get<{
    Querystring: { workshopId?: string; customerId?: string };
    Reply: ApiResponse<VehicleDTO[]>;
  }>('/', { schema: listVehiclesSchema }, async (request, reply) => {
    const { workshopId, customerId } = request.query;

    if (!workshopId && !customerId) {
      return reply.status(400).send({
        success: false,
        data: undefined as never,
        meta: { error: 'Query parameter workshopId or customerId is required' },
      });
    }

    const vehicles = customerId
      ? await listUseCase.executeByCustomer(customerId)
      : await listUseCase.executeByWorkshop(workshopId ?? '');

    return reply.send({
      success: true,
      data: vehicles,
      meta: { total: vehicles.length },
    });
  });

  // ── GET /:id — Buscar veículo por ID ───────────────────────────────────
  app.get<{
    Params: { id: string };
    Reply: ApiResponse<VehicleDTO>;
  }>('/:id', { schema: getVehicleSchema }, async (request, reply) => {
    const vehicle = await getUseCase.execute(request.params.id);

    if (!vehicle) {
      return reply.status(404).send({
        success: false,
        data: undefined as never,
        meta: { error: 'Vehicle not found' },
      });
    }

    return reply.send({ success: true, data: vehicle });
  });

  // ── PUT /:id — Atualizar veículo ───────────────────────────────────────
  app.put<{
    Params: { id: string };
    Body: UpdateVehicleRequest;
    Reply: ApiResponse<VehicleDTO>;
  }>('/:id', { schema: updateVehicleSchema }, async (request, reply) => {
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
  });

  // ── DELETE /:id — Deletar veículo ──────────────────────────────────────
  app.delete<{
    Params: { id: string };
    Reply: ApiResponse<{ deleted: boolean }>;
  }>('/:id', { schema: deleteVehicleSchema }, async (request, reply) => {
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
  });
}
