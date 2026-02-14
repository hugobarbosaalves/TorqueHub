import type { PrismaClient } from '@prisma/client';
import type { CreateCustomerRequest, UpdateCustomerRequest } from '@torquehub/contracts';

export interface CustomerRecord {
  id: string;
  workshopId: string;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class CustomerRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(input: CreateCustomerRequest): Promise<CustomerRecord> {
    return this.db.customer.create({
      data: {
        workshopId: input.workshopId,
        name: input.name,
        document: input.document ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
      },
    });
  }

  async findById(id: string): Promise<CustomerRecord | null> {
    return this.db.customer.findUnique({ where: { id } });
  }

  async findByWorkshopId(workshopId: string): Promise<CustomerRecord[]> {
    return this.db.customer.findMany({
      where: { workshopId },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, input: UpdateCustomerRequest): Promise<CustomerRecord> {
    return this.db.customer.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.document !== undefined && { document: input.document }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.email !== undefined && { email: input.email }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.customer.delete({ where: { id } });
  }
}
