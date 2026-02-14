import type { PrismaClient } from '@prisma/client';
import type { CreateServiceOrderRequest } from '@torquehub/contracts';

export interface ServiceOrderWithItems {
  id: string;
  workshopId: string;
  customerId: string;
  vehicleId: string;
  description: string;
  status: string;
  observations: string | null;
  totalAmount: number;
  publicToken: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export class ServiceOrderRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(input: CreateServiceOrderRequest): Promise<ServiceOrderWithItems> {
    const totalAmount = input.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    return this.db.serviceOrder.create({
      data: {
        workshopId: input.workshopId,
        customerId: input.customerId,
        vehicleId: input.vehicleId,
        description: input.description,
        totalAmount,
        items: {
          create: input.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });
  }

  async findById(id: string): Promise<ServiceOrderWithItems | null> {
    return this.db.serviceOrder.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async findByWorkshopId(workshopId: string): Promise<ServiceOrderWithItems[]> {
    return this.db.serviceOrder.findMany({
      where: { workshopId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(): Promise<ServiceOrderWithItems[]> {
    return this.db.serviceOrder.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string): Promise<ServiceOrderWithItems> {
    return this.db.serviceOrder.update({
      where: { id },
      data: { status: status as never },
      include: { items: true },
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.serviceOrder.delete({ where: { id } });
  }
}
