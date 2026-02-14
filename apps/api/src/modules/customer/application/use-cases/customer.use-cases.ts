import type { CustomerDTO, CreateCustomerRequest } from '@torquehub/contracts';
import { CustomerRepository } from '../../infrastructure/repositories/customer.repository.js';
import type { CustomerRecord } from '../../infrastructure/repositories/customer.repository.js';

function toDTO(c: CustomerRecord): CustomerDTO {
  return {
    id: c.id,
    workshopId: c.workshopId,
    name: c.name,
    document: c.document,
    phone: c.phone,
    email: c.email,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export class CreateCustomerUseCase {
  constructor(private readonly repo: CustomerRepository) {}

  async execute(input: CreateCustomerRequest): Promise<CustomerDTO> {
    const customer = await this.repo.create(input);
    return toDTO(customer);
  }
}

export class ListCustomersUseCase {
  constructor(private readonly repo: CustomerRepository) {}

  async execute(workshopId: string): Promise<CustomerDTO[]> {
    const customers = await this.repo.findByWorkshopId(workshopId);
    return customers.map(toDTO);
  }
}

export class GetCustomerUseCase {
  constructor(private readonly repo: CustomerRepository) {}

  async execute(id: string): Promise<CustomerDTO | null> {
    const customer = await this.repo.findById(id);
    if (!customer) return null;
    return toDTO(customer);
  }
}
