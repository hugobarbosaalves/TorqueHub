import type { ServiceOrderDTO } from '@torquehub/contracts';
import { ServiceOrderRepository } from '../../infrastructure/repositories/service-order.repository.js';
import type { ServiceOrderWithItems } from '../../infrastructure/repositories/service-order.repository.js';

/** Maps a raw ServiceOrderWithItems to the API-facing ServiceOrderDTO. */
function toDTO(so: ServiceOrderWithItems): ServiceOrderDTO {
  return {
    id: so.id,
    workshopId: so.workshopId,
    customerId: so.customerId,
    vehicleId: so.vehicleId,
    description: so.description,
    status: so.status as ServiceOrderDTO['status'],
    observations: so.observations,
    totalAmount: so.totalAmount,
    publicToken: so.publicToken,
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

/** Use case: busca uma ordem de serviço pelo token público do cliente. */
export class GetOrderByTokenUseCase {
  constructor(private readonly repo: ServiceOrderRepository) {}

  async execute(token: string): Promise<ServiceOrderDTO | null> {
    const order = await this.repo.findByPublicToken(token);
    if (!order) return null;
    return toDTO(order);
  }
}

/** Use case: busca o histórico de ordens do veículo vinculado a uma ordem. */
export class GetVehicleHistoryUseCase {
  constructor(private readonly repo: ServiceOrderRepository) {}

  async execute(token: string): Promise<ServiceOrderDTO[]> {
    const order = await this.repo.findByPublicToken(token);
    if (!order) return [];

    const orders = await this.repo.findByVehicleId(order.vehicleId);
    return orders.map(toDTO);
  }
}
