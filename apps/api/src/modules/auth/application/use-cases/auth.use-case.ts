/**
 * Authentication use cases — login and register.
 * @module auth-use-cases
 */

import { compare, hash } from 'bcryptjs';
import type { UserDTO, AuthResponse, JwtPayload } from '@torquehub/contracts';
import type {
  UserRepository,
  UserRecord,
} from '../../infrastructure/repositories/user.repository.js';
import type { UserRole as PrismaUserRole } from '@prisma/client';

const SALT_ROUNDS = 10;

/** Maps a UserRecord to the API-facing UserDTO (no password). */
function toDTO(user: UserRecord): UserDTO {
  return {
    id: user.id,
    workshopId: user.workshopId,
    name: user.name,
    email: user.email,
    role: user.role as UserDTO['role'],
    createdAt: user.createdAt.toISOString(),
  };
}

/** Use case: authenticate a user with email + password. */
export class LoginUseCase {
  constructor(
    private readonly repo: UserRepository,
    private readonly signToken: (payload: JwtPayload) => string,
  ) {}

  /** Returns an AuthResponse or null if credentials are invalid. */
  async execute(email: string, password: string): Promise<AuthResponse | null> {
    const user = await this.repo.findByEmail(email);
    if (!user) return null;

    const valid = await compare(password, user.passwordHash);
    if (!valid) return null;

    const token = this.signToken({
      sub: user.id,
      workshopId: user.workshopId,
      role: user.role as JwtPayload['role'],
    });

    return { token, user: toDTO(user) };
  }
}

/** Use case: register a new user (admin-only in production). */
export class RegisterUseCase {
  constructor(private readonly repo: UserRepository) {}

  async execute(input: {
    workshopId: string;
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<UserDTO> {
    const existing = await this.repo.findByEmail(input.email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const passwordHash = await hash(input.password, SALT_ROUNDS);
    const user = await this.repo.create({
      workshopId: input.workshopId,
      name: input.name,
      email: input.email,
      passwordHash,
      ...(input.role ? { role: input.role as PrismaUserRole } : {}),
    });

    return toDTO(user);
  }
}

/** Use case: get the current user profile from a JWT sub claim. */
export class GetProfileUseCase {
  constructor(private readonly repo: UserRepository) {}

  async execute(userId: string): Promise<UserDTO | null> {
    const user = await this.repo.findById(userId);
    if (!user) return null;
    return toDTO(user);
  }
}
