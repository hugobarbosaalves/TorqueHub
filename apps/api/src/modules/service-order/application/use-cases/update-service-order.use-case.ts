import type { UpdateServiceOrderRequest, ServiceOrderDTO } from '@torquehub/contracts';
import { ORDER_STATUS } from '@torquehub/contracts';
import { ServiceOrderRepository } from '../../infrastructure/repositories/service-order.repository.js';

/** Use case: update a service order — only allowed while status is DRAFT. */
export class UpdateServiceOrderUseCase {
  constructor(private readonly repo: ServiceOrderRepository) {}

  async execute(id: string, input: UpdateServiceOrderRequest): Promise<ServiceOrderDTO> {
    const existing = await this.repo.findById(id);

    if (!existing) {
      throw new NotFoundError('Service order not found');
    }

    if (existing.status !== ORDER_STATUS.DRAFT) {
      throw new ForbiddenStatusError(
        `Cannot edit order with status "${existing.status}". Only DRAFT orders can be edited.`,
      );
    }

    const updated = await this.repo.update(id, input);

    return {
      id: updated.id,
      workshopId: updated.workshopId,
      customerId: updated.customerId,
      vehicleId: updated.vehicleId,
      description: updated.description,
      status: updated.status as ServiceOrderDTO['status'],
      observations: updated.observations,
      items: updated.items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      })),
      totalAmount: updated.totalAmount,
      publicToken: updated.publicToken,
      customerName: updated.customer?.name ?? null,
      vehiclePlate: updated.vehicle?.plate ?? null,
      vehicleSummary: updated.vehicle
        ? `${updated.vehicle.brand} ${updated.vehicle.model}`
        : null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}

/** Thrown when the service order is not found. */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/** Thrown when the order status does not allow the operation. */
export class ForbiddenStatusError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenStatusError';
  }
}
