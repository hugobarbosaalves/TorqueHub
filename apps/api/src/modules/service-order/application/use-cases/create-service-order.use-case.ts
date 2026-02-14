import type { CreateServiceOrderRequest, CreateServiceOrderResponse } from '@torquehub/contracts';
import { generateId, nowISO } from '@torquehub/utils';
import { ServiceOrder } from '../../domain/entities/service-order.js';

export class CreateServiceOrderUseCase {
  async execute(input: CreateServiceOrderRequest): Promise<CreateServiceOrderResponse> {
    const serviceOrder = ServiceOrder.create({
      id: generateId(),
      workshopId: input.workshopId,
      customerId: input.customerId,
      vehicleId: input.vehicleId,
      description: input.description,
      items: input.items.map((item) => ({
        id: generateId(),
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });

    // TODO: persist via repository when database is ready

    return {
      id: serviceOrder.id,
      status: serviceOrder.status,
      createdAt: nowISO(),
    };
  }
}
