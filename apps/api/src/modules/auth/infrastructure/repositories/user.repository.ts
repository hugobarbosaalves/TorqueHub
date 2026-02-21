/**
 * User repository — data access layer for the User model.
 * @module user-repository
 */

import type { PrismaClient, UserRole } from '@prisma/client';

/** Raw database record shape returned by Prisma for User. */
export interface UserRecord {
  id: string;
  workshopId: string | null;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Input for creating a new user. */
interface CreateUserInput {
  workshopId?: string | null;
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
}

/** Repository for managing User persistence. */
export class UserRepository {
  constructor(private readonly db: PrismaClient) {}

  /** Creates a new user record. */
  async create(input: CreateUserInput): Promise<UserRecord> {
    return this.db.user.create({ data: input }) as Promise<UserRecord>;
  }

  /** Finds a user by email (unique). Returns null if not found. */
  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.db.user.findUnique({ where: { email } }) as Promise<UserRecord | null>;
  }

  /** Finds a user by ID. Returns null if not found. */
  async findById(id: string): Promise<UserRecord | null> {
    return this.db.user.findUnique({ where: { id } }) as Promise<UserRecord | null>;
  }

  /** Lists all users for a given workshop. */
  async findByWorkshopId(workshopId: string): Promise<UserRecord[]> {
    return this.db.user.findMany({
      where: { workshopId },
      orderBy: { name: 'asc' },
    }) as Promise<UserRecord[]>;
  }

  /** Updates the user's password hash and clears mustChangePassword flag. */
  async updatePassword(userId: string, passwordHash: string): Promise<UserRecord> {
    return this.db.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: false },
    }) as Promise<UserRecord>;
  }
}
