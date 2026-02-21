/**
 * Admin controller — HTTP routes for platform administration.
 * All routes restricted to PLATFORM_ADMIN role.
 * Registered under `/admin`.
 * @module admin-controller
 */

import type { FastifyInstance } from 'fastify';
import type {
  ApiResponse,
  WorkshopDTO,
  UserDTO,
  PlatformMetricsDTO,
  CreateWorkshopRequest,
  UpdateWorkshopRequest,
  CreateWorkshopUserRequest,
} from '@torquehub/contracts';
import { prisma } from '../../../../shared/infrastructure/database/prisma.js';
import { requireRole } from '../../../../shared/infrastructure/auth/role-guard.js';
import { AdminRepository } from '../../infrastructure/repositories/admin.repository.js';
import {
  ListWorkshopsUseCase,
  GetWorkshopUseCase,
  CreateWorkshopUseCase,
  UpdateWorkshopUseCase,
  ListWorkshopUsersUseCase,
  CreateWorkshopUserUseCase,
  GetPlatformMetricsUseCase,
} from '../../application/use-cases/admin.use-cases.js';
import {
  listWorkshopsSchema,
  createWorkshopSchema,
  getWorkshopSchema,
  updateWorkshopSchema,
  listWorkshopUsersSchema,
  createWorkshopUserSchema,
  getMetricsSchema,
} from './admin.schemas.js';

const repo = new AdminRepository(prisma);
const listWorkshopsUC = new ListWorkshopsUseCase(repo);
const getWorkshopUC = new GetWorkshopUseCase(repo);
const createWorkshopUC = new CreateWorkshopUseCase(repo);
const updateWorkshopUC = new UpdateWorkshopUseCase(repo);
const listUsersUC = new ListWorkshopUsersUseCase(repo);
const createUserUC = new CreateWorkshopUserUseCase(repo);
const metricsUC = new GetPlatformMetricsUseCase(repo);

/** Registers all admin routes (PLATFORM_ADMIN only). */
export function adminRoutes(app: FastifyInstance): void {
  /** Lista todas as oficinas da plataforma. */
  app.get<{ Reply: ApiResponse<WorkshopDTO[]> }>(
    '/workshops',
    { schema: listWorkshopsSchema, onRequest: [requireRole('PLATFORM_ADMIN')] },
    async (_request, reply) => {
      const workshops = await listWorkshopsUC.execute();
      return reply.send({
        success: true,
        data: workshops,
        meta: { total: workshops.length },
      });
    },
  );

  /** Cria uma nova oficina. */
  app.post<{ Body: CreateWorkshopRequest; Reply: ApiResponse<WorkshopDTO> }>(
    '/workshops',
    { schema: createWorkshopSchema, onRequest: [requireRole('PLATFORM_ADMIN')] },
    async (request, reply) => {
      const { name, document } = request.body;
      if (!name || !document) {
        return reply.status(400).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Missing required fields: name, document' },
        });
      }

      try {
        const workshop = await createWorkshopUC.execute(request.body);
        return await reply.status(201).send({ success: true, data: workshop });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create workshop';
        return reply.status(400).send({
          success: false,
          data: undefined as never,
          meta: { error: message },
        });
      }
    },
  );

  /** Busca uma oficina pelo ID. */
  app.get<{ Params: { id: string }; Reply: ApiResponse<WorkshopDTO> }>(
    '/workshops/:id',
    { schema: getWorkshopSchema, onRequest: [requireRole('PLATFORM_ADMIN')] },
    async (request, reply) => {
      const workshop = await getWorkshopUC.execute(request.params.id);
      if (!workshop) {
        return reply.status(404).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Workshop not found' },
        });
      }

      return reply.send({ success: true, data: workshop });
    },
  );

  /** Atualiza dados de uma oficina. */
  app.patch<{
    Params: { id: string };
    Body: UpdateWorkshopRequest;
    Reply: ApiResponse<WorkshopDTO>;
  }>(
    '/workshops/:id',
    { schema: updateWorkshopSchema, onRequest: [requireRole('PLATFORM_ADMIN')] },
    async (request, reply) => {
      try {
        const workshop = await updateWorkshopUC.execute(request.params.id, request.body);
        return await reply.send({ success: true, data: workshop });
      } catch {
        return reply.status(404).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Workshop not found' },
        });
      }
    },
  );

  /** Lista usuários de uma oficina. PLATFORM_ADMIN acessa qualquer oficina; WORKSHOP_OWNER acessa apenas a própria. */
  app.get<{ Params: { id: string }; Reply: ApiResponse<UserDTO[]> }>(
    '/workshops/:id/users',
    {
      schema: listWorkshopUsersSchema,
      onRequest: [requireRole('PLATFORM_ADMIN', 'WORKSHOP_OWNER')],
    },
    async (request, reply) => {
      const workshopId = request.params.id;
      const isOwner = request.user.role === 'WORKSHOP_OWNER';

      if (isOwner && request.tenantId !== workshopId) {
        return reply.status(403).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Access denied: can only manage your own workshop team' },
        });
      }

      const users = await listUsersUC.execute(workshopId);
      return reply.send({
        success: true,
        data: users,
        meta: { total: users.length },
      });
    },
  );

  /** Cria um usuário vinculado a uma oficina. PLATFORM_ADMIN cria qualquer role; WORKSHOP_OWNER cria apenas MECHANICs na própria oficina. */
  app.post<{
    Params: { id: string };
    Body: CreateWorkshopUserRequest;
    Reply: ApiResponse<UserDTO>;
  }>(
    '/workshops/:id/users',
    {
      schema: createWorkshopUserSchema,
      onRequest: [requireRole('PLATFORM_ADMIN', 'WORKSHOP_OWNER')],
    },
    async (request, reply) => {
      const workshopId = request.params.id;
      const { name, email, password, role } = request.body;
      const isOwner = request.user.role === 'WORKSHOP_OWNER';

      if (isOwner && request.tenantId !== workshopId) {
        return reply.status(403).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Access denied: can only manage your own workshop team' },
        });
      }

      if (isOwner && role !== 'MECHANIC') {
        return reply.status(403).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Workshop owners can only create MECHANIC users' },
        });
      }

      if (!name || !email || !password || !role) {
        return reply.status(400).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Missing required fields: name, email, password, role' },
        });
      }

      try {
        const user = await createUserUC.execute(workshopId, request.body);
        return await reply.status(201).send({ success: true, data: user });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create user';
        return reply.status(400).send({
          success: false,
          data: undefined as never,
          meta: { error: message },
        });
      }
    },
  );

  /** Métricas globais da plataforma. */
  app.get<{ Reply: ApiResponse<PlatformMetricsDTO> }>(
    '/metrics',
    { schema: getMetricsSchema, onRequest: [requireRole('PLATFORM_ADMIN')] },
    async (_request, reply) => {
      const metrics = await metricsUC.execute();
      return reply.send({ success: true, data: metrics });
    },
  );
}
