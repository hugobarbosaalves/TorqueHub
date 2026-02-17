import type { ServiceOrderDTO, PublicOrderDetailDTO, MediaDTO } from '@torquehub/contracts';
import { ServiceOrderRepository } from '../../infrastructure/repositories/service-order.repository.js';
import type {
  ServiceOrderWithItems,
  ServiceOrderWithRelations,
} from '../../infrastructure/repositories/service-order.repository.js';

/** Maps a raw ServiceOrderWithItems to the API-facing ServiceOrderDTO. */
function toDTO(so: ServiceOrderWithItems): ServiceOrderDTO {
  const vehicle = so.vehicle;
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
    vehicleSummary: vehicle ? `${vehicle.brand} ${vehicle.model}` : null,
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

/** Maps a full order record (with relations) to PublicOrderDetailDTO. */
function toPublicDetailDTO(so: ServiceOrderWithRelations): PublicOrderDetailDTO {
  return {
    ...toDTO(so),
    vehicle: {
      plate: so.vehicle.plate,
      brand: so.vehicle.brand,
      model: so.vehicle.model,
      year: so.vehicle.year,
      color: so.vehicle.color,
    },
    customerName: so.customer.name,
    media: so.media.map(
      (m): MediaDTO => ({
        id: m.id,
        serviceOrderId: m.serviceOrderId,
        type: m.type as MediaDTO['type'],
        url: m.url,
        caption: m.caption,
        createdAt: m.createdAt.toISOString(),
      }),
    ),
  };
}

/** Use case: busca uma ordem de serviço pelo token público do cliente. */
export class GetOrderByTokenUseCase {
  constructor(private readonly repo: ServiceOrderRepository) {}

  async execute(token: string): Promise<PublicOrderDetailDTO | null> {
    const order = await this.repo.findByPublicTokenFull(token);
    if (!order) return null;
    return toPublicDetailDTO(order);
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
