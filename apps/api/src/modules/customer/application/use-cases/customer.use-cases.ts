import type { CustomerDTO, CreateCustomerRequest } from '@torquehub/contracts';
import { CustomerRepository } from '../../infrastructure/repositories/customer.repository.js';
import type { CustomerRecord } from '../../infrastructure/repositories/customer.repository.js';

/** Maps a raw CustomerRecord to the API-facing CustomerDTO. */
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

/** Use case: create a new customer in the workshop. */
export class CreateCustomerUseCase {
  constructor(private readonly repo: CustomerRepository) {}

  async execute(input: CreateCustomerRequest): Promise<CustomerDTO> {
    const customer = await this.repo.create(input);
    return toDTO(customer);
  }
}

/** Use case: list all customers for a given workshop. */
export class ListCustomersUseCase {
  constructor(private readonly repo: CustomerRepository) {}

  async execute(workshopId: string): Promise<CustomerDTO[]> {
    const customers = await this.repo.findByWorkshopId(workshopId);
    return customers.map(toDTO);
  }
}

/** Use case: get a single customer by ID. */
export class GetCustomerUseCase {
  constructor(private readonly repo: CustomerRepository) {}

  async execute(id: string): Promise<CustomerDTO | null> {
    const customer = await this.repo.findById(id);
    if (!customer) return null;
    return toDTO(customer);
  }
}
