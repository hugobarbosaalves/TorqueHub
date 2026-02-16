import type { ServiceOrderDTO } from '@torquehub/contracts';
import { ServiceOrderRepository } from '../../infrastructure/repositories/service-order.repository.js';
import type { ServiceOrderWithItems } from '../../infrastructure/repositories/service-order.repository.js';

/** Maps a raw ServiceOrderWithItems to the API-facing ServiceOrderDTO. */
function toDTO(so: ServiceOrderWithItems): ServiceOrderDTO {
  const vehicle = so.vehicle;
  const vehicleSummary = vehicle
    ? `${vehicle.brand} ${vehicle.model}`
    : null;

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
    customerName: so.customer?.name ?? null,
    vehiclePlate: vehicle?.plate ?? null,
    vehicleSummary,
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

/** Use case: list service orders, optionally filtered by workshop. */
export class ListServiceOrdersUseCase {
  constructor(private readonly repo: ServiceOrderRepository) {}

  async execute(workshopId?: string): Promise<ServiceOrderDTO[]> {
    const orders = workshopId
      ? await this.repo.findByWorkshopId(workshopId)
      : await this.repo.findAll();

    return orders.map(toDTO);
  }
}

/** Use case: get a single service order by ID. */
export class GetServiceOrderUseCase {
  constructor(private readonly repo: ServiceOrderRepository) {}

  async execute(id: string): Promise<ServiceOrderDTO | null> {
    const order = await this.repo.findById(id);
    if (!order) return null;
    return toDTO(order);
  }
}
