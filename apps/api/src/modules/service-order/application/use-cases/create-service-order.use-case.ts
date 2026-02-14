import type { CreateServiceOrderRequest, CreateServiceOrderResponse } from '@torquehub/contracts';
import { ServiceOrderRepository } from '../../infrastructure/repositories/service-order.repository.js';

/** Use case: create a new service order with line items. */
export class CreateServiceOrderUseCase {
  constructor(private readonly repo: ServiceOrderRepository) {}

  async execute(input: CreateServiceOrderRequest): Promise<CreateServiceOrderResponse> {
    const serviceOrder = await this.repo.create(input);

    return {
      id: serviceOrder.id,
      status: serviceOrder.status as CreateServiceOrderResponse['status'],
      createdAt: serviceOrder.createdAt.toISOString(),
    };
  }
}
