import type { VehicleDTO, CreateVehicleRequest } from '@torquehub/contracts';
import { VehicleRepository } from '../../infrastructure/repositories/vehicle.repository.js';
import type { VehicleRecord } from '../../infrastructure/repositories/vehicle.repository.js';

function toDTO(v: VehicleRecord): VehicleDTO {
  return {
    id: v.id,
    workshopId: v.workshopId,
    customerId: v.customerId,
    plate: v.plate,
    brand: v.brand,
    model: v.model,
    year: v.year,
    color: v.color,
    mileage: v.mileage,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  };
}

export class CreateVehicleUseCase {
  constructor(private readonly repo: VehicleRepository) {}

  async execute(input: CreateVehicleRequest): Promise<VehicleDTO> {
    const vehicle = await this.repo.create(input);
    return toDTO(vehicle);
  }
}

export class ListVehiclesUseCase {
  constructor(private readonly repo: VehicleRepository) {}

  async executeByWorkshop(workshopId: string): Promise<VehicleDTO[]> {
    const vehicles = await this.repo.findByWorkshopId(workshopId);
    return vehicles.map(toDTO);
  }

  async executeByCustomer(customerId: string): Promise<VehicleDTO[]> {
    const vehicles = await this.repo.findByCustomerId(customerId);
    return vehicles.map(toDTO);
  }
}

export class GetVehicleUseCase {
  constructor(private readonly repo: VehicleRepository) {}

  async execute(id: string): Promise<VehicleDTO | null> {
    const vehicle = await this.repo.findById(id);
    if (!vehicle) return null;
    return toDTO(vehicle);
  }
}
