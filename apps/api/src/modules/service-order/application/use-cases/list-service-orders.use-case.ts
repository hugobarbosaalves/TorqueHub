import type { ServiceOrderDTO } from '@torquehub/contracts';
import { ServiceOrderRepository } from '../../infrastructure/repositories/service-order.repository.js';
import type { ServiceOrderWithItems } from '../../infrastructure/repositories/service-order.repository.js';

function toDTO(so: ServiceOrderWithItems): ServiceOrderDTO {
  return {
    id: so.id,
    workshopId: so.workshopId,
    customerId: so.customerId,
    vehicleId: so.vehicleId,
    description: so.description,
    status: so.status as ServiceOrderDTO['status'],
    totalAmount: so.totalAmount,
    items: so.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
    })),
    createdAt: so.createdAt.toISOString(),
    updatedAt: so.updatedAt.toISOString(),
  };
}

export class ListServiceOrdersUseCase {
  constructor(private readonly repo: ServiceOrderRepository) {}

  async execute(workshopId?: string): Promise<ServiceOrderDTO[]> {
    const orders = workshopId
      ? await this.repo.findByWorkshopId(workshopId)
      : await this.repo.findAll();

    return orders.map(toDTO);
  }
}

export class GetServiceOrderUseCase {
  constructor(private readonly repo: ServiceOrderRepository) {}

  async execute(id: string): Promise<ServiceOrderDTO | null> {
    const order = await this.repo.findById(id);
    if (!order) return null;
    return toDTO(order);
  }
}
