import type { FastifyInstance } from 'fastify';
import type { ApiResponse, PublicOrderDetailDTO, ServiceOrderDTO } from '@torquehub/contracts';
import { prisma } from '../../../../shared/infrastructure/database/prisma.js';
import { ServiceOrderRepository } from '../../infrastructure/repositories/service-order.repository.js';
import {
  GetOrderByTokenUseCase,
  GetVehicleHistoryUseCase,
} from '../../application/use-cases/public-order.use-case.js';
import { getOrderByTokenSchema, getVehicleHistorySchema } from './public-order.schemas.js';

const repo = new ServiceOrderRepository(prisma);
const getByTokenUseCase = new GetOrderByTokenUseCase(repo);
const vehicleHistoryUseCase = new GetVehicleHistoryUseCase(repo);

/** Registra as rotas públicas de acesso do cliente (sem autenticação). */
export function publicOrderRoutes(app: FastifyInstance): void {
  /** Busca uma ordem de serviço pelo token público. */
  app.get<{
    Params: { token: string };
    Reply: ApiResponse<PublicOrderDetailDTO>;
  }>('/:token', { schema: getOrderByTokenSchema }, async (request, reply) => {
    const order = await getByTokenUseCase.execute(request.params.token);

    if (!order) {
      return reply.status(404).send({
        success: false,
        data: undefined as never,
        meta: { error: 'Ordem não encontrada. Verifique o token informado.' },
      });
    }

    return reply.send({
      success: true,
      data: order,
    });
  });

  /** Busca o histórico de serviços do veículo via token público. */
  app.get<{
    Params: { token: string };
    Reply: ApiResponse<ServiceOrderDTO[]>;
  }>('/:token/vehicle-history', { schema: getVehicleHistorySchema }, async (request, reply) => {
    const orders = await vehicleHistoryUseCase.execute(request.params.token);

    if (orders.length === 0) {
      return reply.status(404).send({
        success: false,
        data: undefined as never,
        meta: { error: 'Nenhum histórico encontrado para este token.' },
      });
    }

    return reply.send({
      success: true,
      data: orders,
      meta: { total: orders.length },
    });
  });
}
