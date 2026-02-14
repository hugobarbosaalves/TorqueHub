import type { VehicleDTO, CreateVehicleRequest } from '@torquehub/contracts';
import { VehicleRepository } from '../../infrastructure/repositories/vehicle.repository.js';
import type { VehicleRecord } from '../../infrastructure/repositories/vehicle.repository.js';

/** Maps a raw VehicleRecord to the API-facing VehicleDTO. */
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

/** Use case: register a new vehicle for a customer. */
export class CreateVehicleUseCase {
  constructor(private readonly repo: VehicleRepository) {}

  async execute(input: CreateVehicleRequest): Promise<VehicleDTO> {
    const vehicle = await this.repo.create(input);
    return toDTO(vehicle);
  }
}

/** Use case: list vehicles filtered by workshop or customer. */
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

/** Use case: get a single vehicle by ID. */
export class GetVehicleUseCase {
  constructor(private readonly repo: VehicleRepository) {}

  async execute(id: string): Promise<VehicleDTO | null> {
    const vehicle = await this.repo.findById(id);
    if (!vehicle) return null;
    return toDTO(vehicle);
  }
}
