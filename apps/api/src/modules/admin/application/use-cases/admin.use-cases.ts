/**
 * Admin use cases — business logic for platform-level operations.
 * Handles workshop CRUD, user creation within workshops, and metrics.
 * @module admin-use-cases
 */

import type {
  WorkshopDTO,
  UserDTO,
  PlatformMetricsDTO,
  CreateWorkshopRequest,
  UpdateWorkshopRequest,
  CreateWorkshopUserRequest,
  UpdateWorkshopUserRequest,
} from '@torquehub/contracts';
import type {
  AdminRepository,
  WorkshopRecord,
} from '../../infrastructure/repositories/admin.repository.js';
import type { User } from '@prisma/client';
import { sendInviteEmail } from '../../../../shared/infrastructure/email/email.service.js';

/** Converts a Workshop DB record to a DTO. */
function toWorkshopDTO(workshop: WorkshopRecord): WorkshopDTO {
  return {
    id: workshop.id,
    name: workshop.name,
    document: workshop.document,
    phone: workshop.phone,
    email: workshop.email,
    address: workshop.address,
    createdAt: workshop.createdAt.toISOString(),
    updatedAt: workshop.updatedAt.toISOString(),
  };
}

/** Converts a User DB record to a DTO (no password). */
function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    workshopId: user.workshopId,
    name: user.name,
    email: user.email,
    role: user.role as UserDTO['role'],
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt.toISOString(),
  };
}

/** Use case: list all workshops. */
export class ListWorkshopsUseCase {
  constructor(private readonly repo: AdminRepository) {}

  /** Returns all workshops as DTOs. */
  async execute(): Promise<WorkshopDTO[]> {
    const workshops = await this.repo.listWorkshops();
    return workshops.map(toWorkshopDTO);
  }
}

/** Use case: get a workshop by ID. */
export class GetWorkshopUseCase {
  constructor(private readonly repo: AdminRepository) {}

  /** Returns a single workshop DTO or null. */
  async execute(id: string): Promise<WorkshopDTO | null> {
    const workshop = await this.repo.findWorkshopById(id);
    return workshop ? toWorkshopDTO(workshop) : null;
  }
}

/** Use case: create a new workshop. */
export class CreateWorkshopUseCase {
  constructor(private readonly repo: AdminRepository) {}

  /** Creates a workshop and returns the DTO. */
  async execute(input: CreateWorkshopRequest): Promise<WorkshopDTO> {
    const workshop = await this.repo.createWorkshop(input);
    return toWorkshopDTO(workshop);
  }
}

/** Use case: update an existing workshop. */
export class UpdateWorkshopUseCase {
  constructor(private readonly repo: AdminRepository) {}

  /** Updates a workshop and returns the DTO. */
  async execute(id: string, input: UpdateWorkshopRequest): Promise<WorkshopDTO> {
    const workshop = await this.repo.updateWorkshop(id, input);
    return toWorkshopDTO(workshop);
  }
}

/** Use case: list users of a workshop. */
export class ListWorkshopUsersUseCase {
  constructor(private readonly repo: AdminRepository) {}

  /** Returns all users for a workshop as DTOs. */
  async execute(workshopId: string): Promise<UserDTO[]> {
    const users = await this.repo.listWorkshopUsers(workshopId);
    return users.map(toUserDTO);
  }
}

/** Use case: create a user within a workshop. */
export class CreateWorkshopUserUseCase {
  constructor(private readonly repo: AdminRepository) {}

  /**
   * Creates a user linked to a workshop and sends an invitation email.
   * The email contains the temporary password for first access.
   */
  async execute(workshopId: string, input: CreateWorkshopUserRequest): Promise<UserDTO> {
    const workshop = await this.repo.findWorkshopById(workshopId);
    const workshopName = workshop?.name ?? 'Oficina';

    const user = await this.repo.createWorkshopUser({
      workshopId,
      ...input,
    });

    await sendInviteEmail(input.email, input.name, input.password, workshopName, input.role);

    return toUserDTO(user);
  }
}

/** Use case: delete a workshop and all its data. */
export class DeleteWorkshopUseCase {
  constructor(private readonly repo: AdminRepository) {}

  /** Deletes a workshop by ID. Throws if not found. */
  async execute(id: string): Promise<void> {
    const workshop = await this.repo.findWorkshopById(id);
    if (!workshop) throw new Error('Workshop not found');
    await this.repo.deleteWorkshop(id);
  }
}

/** Use case: update a user within a workshop. */
export class UpdateWorkshopUserUseCase {
  constructor(private readonly repo: AdminRepository) {}

  /** Updates user data and returns the DTO. */
  async execute(userId: string, input: UpdateWorkshopUserRequest): Promise<UserDTO> {
    const user = await this.repo.updateUser(userId, input);
    return toUserDTO(user);
  }
}

/** Use case: delete a user. */
export class DeleteWorkshopUserUseCase {
  constructor(private readonly repo: AdminRepository) {}

  /** Deletes a user by ID. Throws if not found. */
  async execute(userId: string): Promise<void> {
    const user = await this.repo.findUserById(userId);
    if (!user) throw new Error('User not found');
    await this.repo.deleteUser(userId);
  }
}

/** Use case: get platform-wide metrics. */
export class GetPlatformMetricsUseCase {
  constructor(private readonly repo: AdminRepository) {}

  /** Returns aggregate metrics for the platform. */
  async execute(): Promise<PlatformMetricsDTO> {
    return this.repo.getMetrics();
  }
}
