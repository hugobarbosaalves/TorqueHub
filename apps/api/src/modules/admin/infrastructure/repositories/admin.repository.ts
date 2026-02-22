/**
 * Admin repository — data access for platform-level operations.
 * Queries workshops, users, and aggregate metrics.
 * @module admin-repository
 */

import type { PrismaClient, User } from '@prisma/client';
import { hash } from 'bcryptjs';

const SALT_ROUNDS = 10;

/** Shape of a workshop record returned by the repository. */
export interface WorkshopRecord {
  id: string;
  name: string;
  document: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Input for creating a new workshop. */
export interface CreateWorkshopInput {
  name: string;
  document: string;
  phone?: string;
  email?: string;
  address?: string;
}

/** Input for updating a workshop. */
export interface UpdateWorkshopInput {
  name?: string;
  document?: string;
  phone?: string;
  email?: string;
  address?: string;
}

/** Input for creating a user within a workshop. */
export interface CreateWorkshopUserInput {
  workshopId: string;
  name: string;
  email: string;
  password: string;
  role: 'WORKSHOP_OWNER' | 'MECHANIC';
}

/** Platform-wide aggregate metrics. */
export interface PlatformMetrics {
  totalWorkshops: number;
  totalUsers: number;
  totalServiceOrders: number;
  totalCustomers: number;
}

/** Repository for admin/platform-level data access. */
export class AdminRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /** Lists all workshops, ordered by name. */
  async listWorkshops(): Promise<WorkshopRecord[]> {
    return this.prisma.workshop.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /** Finds a workshop by its ID. */
  async findWorkshopById(id: string): Promise<WorkshopRecord | null> {
    return this.prisma.workshop.findUnique({ where: { id } });
  }

  /** Creates a new workshop. */
  async createWorkshop(data: CreateWorkshopInput): Promise<WorkshopRecord> {
    return this.prisma.workshop.create({ data });
  }

  /** Updates an existing workshop. */
  async updateWorkshop(id: string, data: UpdateWorkshopInput): Promise<WorkshopRecord> {
    return this.prisma.workshop.update({ where: { id }, data });
  }

  /** Lists all users for a given workshop. */
  async listWorkshopUsers(workshopId: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { workshopId },
      orderBy: { name: 'asc' },
    });
  }

  /** Creates a user linked to a workshop with a hashed password. Sets mustChangePassword flag. */
  async createWorkshopUser(input: CreateWorkshopUserInput): Promise<User> {
    const passwordHash = await hash(input.password, SALT_ROUNDS);
    return this.prisma.user.create({
      data: {
        workshopId: input.workshopId,
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role,
        mustChangePassword: true,
      },
    });
  }

  /** Deletes a workshop and all related data in a transaction. */
  async deleteWorkshop(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const serviceOrders = await tx.serviceOrder.findMany({
        where: { workshopId: id },
        select: { id: true },
      });
      const orderIds = serviceOrders.map((order) => order.id);

      if (orderIds.length > 0) {
        await tx.media.deleteMany({ where: { serviceOrderId: { in: orderIds } } });
        await tx.serviceOrderItem.deleteMany({ where: { serviceOrderId: { in: orderIds } } });
        await tx.serviceOrder.deleteMany({ where: { workshopId: id } });
      }

      await tx.vehicle.deleteMany({ where: { workshopId: id } });
      await tx.customer.deleteMany({ where: { workshopId: id } });
      await tx.user.deleteMany({ where: { workshopId: id } });
      await tx.workshop.delete({ where: { id } });
    });
  }

  /** Finds a user by ID. */
  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /** Updates an existing user. */
  async updateUser(id: string, data: { name?: string; email?: string; role?: 'WORKSHOP_OWNER' | 'MECHANIC' }): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  /** Deletes a user by ID. */
  async deleteUser(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  /** Returns platform-wide aggregate metrics. */
  async getMetrics(): Promise<PlatformMetrics> {
    const [totalWorkshops, totalUsers, totalServiceOrders, totalCustomers] = await Promise.all([
      this.prisma.workshop.count(),
      this.prisma.user.count(),
      this.prisma.serviceOrder.count(),
      this.prisma.customer.count(),
    ]);

    return { totalWorkshops, totalUsers, totalServiceOrders, totalCustomers };
  }
}
