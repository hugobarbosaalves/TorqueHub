import type { PrismaClient } from '@prisma/client';
import type { CreateVehicleRequest, UpdateVehicleRequest } from '@torquehub/contracts';

/** Raw database record shape for a vehicle. */
export interface VehicleRecord {
  id: string;
  workshopId: string;
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  year: number | null;
  color: string | null;
  mileage: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Prisma-backed repository for Vehicle persistence operations. */
export class VehicleRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(input: CreateVehicleRequest): Promise<VehicleRecord> {
    return this.db.vehicle.create({
      data: {
        workshopId: input.workshopId,
        customerId: input.customerId,
        plate: input.plate,
        brand: input.brand,
        model: input.model,
        year: input.year ?? null,
        color: input.color ?? null,
        mileage: input.mileage ?? null,
      },
    });
  }

  async findById(id: string): Promise<VehicleRecord | null> {
    return this.db.vehicle.findUnique({ where: { id } });
  }

  async findByWorkshopId(workshopId: string): Promise<VehicleRecord[]> {
    return this.db.vehicle.findMany({
      where: { workshopId },
      orderBy: { plate: 'asc' },
    });
  }

  async findByCustomerId(customerId: string): Promise<VehicleRecord[]> {
    return this.db.vehicle.findMany({
      where: { customerId },
      orderBy: { plate: 'asc' },
    });
  }

  async update(id: string, input: UpdateVehicleRequest): Promise<VehicleRecord> {
    return this.db.vehicle.update({
      where: { id },
      data: {
        ...(input.plate !== undefined && { plate: input.plate }),
        ...(input.brand !== undefined && { brand: input.brand }),
        ...(input.model !== undefined && { model: input.model }),
        ...(input.year !== undefined && { year: input.year }),
        ...(input.color !== undefined && { color: input.color }),
        ...(input.mileage !== undefined && { mileage: input.mileage }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.vehicle.delete({ where: { id } });
  }
}
