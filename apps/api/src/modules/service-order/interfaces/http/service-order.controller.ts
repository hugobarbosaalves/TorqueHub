import type { FastifyInstance } from 'fastify';
import type {
  CreateServiceOrderRequest,
  ApiResponse,
  CreateServiceOrderResponse,
} from '@torquehub/contracts';
import { CreateServiceOrderUseCase } from '../../application/use-cases/create-service-order.use-case.js';

const createServiceOrderUseCase = new CreateServiceOrderUseCase();

export async function serviceOrderRoutes(app: FastifyInstance): Promise<void> {
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

    const result = await createServiceOrderUseCase.execute(body);

    return reply.status(201).send({
      success: true,
      data: result,
    });
  });

  app.get('/', async (_request, reply) => {
    // TODO: implement list service orders
    return reply.send({
      success: true,
      data: [],
      meta: { message: 'List service orders - not yet implemented' },
    });
  });
}
