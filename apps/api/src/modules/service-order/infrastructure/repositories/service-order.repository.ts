import type { PrismaClient } from '@prisma/client';
import type { CreateServiceOrderRequest, UpdateServiceOrderRequest } from '@torquehub/contracts';
import { ORDER_STATUS } from '@torquehub/contracts';

/** Gera um token público alfanumérico de 12 caracteres. */
function generatePublicToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let token = '';
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/** Raw database record shape for a service order with items. */
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
  customer?: { name: string };
  vehicle?: {
    plate: string;
    brand: string;
    model: string;
    year: number | null;
    color: string | null;
  };
}

/** Service order with all relations (vehicle, customer, media) for public detail view. */
export interface ServiceOrderWithRelations extends ServiceOrderWithItems {
  vehicle: {
    plate: string;
    brand: string;
    model: string;
    year: number | null;
    color: string | null;
  };
  customer: { name: string };
  media: {
    id: string;
    serviceOrderId: string;
    type: string;
    url: string;
    caption: string | null;
    createdAt: Date;
  }[];
}

/** Service order with workshop data for PDF quote generation. */
export interface ServiceOrderForQuote extends ServiceOrderWithRelations {
  quoteExpiresAt: Date | null;
  workshop: {
    name: string;
    document: string;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
}

/** Prisma-backed repository for ServiceOrder persistence operations. */
export class ServiceOrderRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(input: CreateServiceOrderRequest): Promise<ServiceOrderWithItems> {
    const totalAmount = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    return this.db.serviceOrder.create({
      data: {
        workshopId: input.workshopId,
        customerId: input.customerId,
        vehicleId: input.vehicleId,
        description: input.description,
        totalAmount,
        publicToken: generatePublicToken(),
        quoteExpiresAt: expiresAt,
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
      include: { items: true, customer: true, vehicle: true },
    });
  }

  /** Atualiza descrição, observações e/ou itens de uma ordem existente. */
  async update(id: string, input: UpdateServiceOrderRequest): Promise<ServiceOrderWithItems> {
    const data: Record<string, unknown> = {};
    if (input.description !== undefined) data.description = input.description;
    if (input.observations !== undefined) data.observations = input.observations;

    if (input.items) {
      data.totalAmount = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

      await this.db.serviceOrderItem.deleteMany({ where: { serviceOrderId: id } });
      data.items = {
        create: input.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };
    }

    return this.db.serviceOrder.update({
      where: { id },
      data: data as never,
      include: { items: true, customer: true, vehicle: true },
    });
  }

  async findByWorkshopId(workshopId: string): Promise<ServiceOrderWithItems[]> {
    return this.db.serviceOrder.findMany({
      where: { workshopId },
      include: { items: true, customer: true, vehicle: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(): Promise<ServiceOrderWithItems[]> {
    return this.db.serviceOrder.findMany({
      include: { items: true, customer: true, vehicle: true },
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

  /** Busca uma ordem pelo token público (link do cliente). */
  async findByPublicToken(token: string): Promise<ServiceOrderWithItems | null> {
    return this.db.serviceOrder.findUnique({
      where: { publicToken: token },
      include: { items: true },
    });
  }

  /** Busca uma ordem pelo token público com veículo, cliente e mídias. */
  async findByPublicTokenFull(token: string): Promise<ServiceOrderWithRelations | null> {
    return this.db.serviceOrder.findUnique({
      where: { publicToken: token },
      include: { items: true, vehicle: true, customer: true, media: true },
    });
  }

  /** Lista todas as ordens de um veículo (histórico). */
  async findByVehicleId(vehicleId: string): Promise<ServiceOrderWithItems[]> {
    return this.db.serviceOrder.findMany({
      where: { vehicleId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Busca ordem com workshop completo para geração de PDF. */
  async findByPublicTokenForQuote(token: string): Promise<ServiceOrderForQuote | null> {
    return this.db.serviceOrder.findUnique({
      where: { publicToken: token },
      include: {
        items: true,
        vehicle: true,
        customer: true,
        media: true,
        workshop: true,
      },
    }) as Promise<ServiceOrderForQuote | null>;
  }

  /** Expira orçamentos DRAFT não iniciados após 30 dias. */
  async expireStaleQuotes(): Promise<number> {
    const result = await this.db.serviceOrder.updateMany({
      where: {
        status: ORDER_STATUS.DRAFT,
        quoteExpiresAt: { lte: new Date() },
      },
      data: { status: ORDER_STATUS.CANCELLED as never },
    });
    return result.count;
  }
}
