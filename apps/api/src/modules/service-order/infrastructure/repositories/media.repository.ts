/**
 * Media repository — Prisma-backed persistence for media files.
 * Handles CRUD operations for photos/videos attached to service orders.
 * @module media-repository
 */

import type { PrismaClient } from '@prisma/client';

/** Shape of a media record returned from the database. */
export interface MediaRecord {
  id: string;
  serviceOrderId: string;
  type: string;
  url: string;
  caption: string | null;
  createdAt: Date;
}

/** Prisma-backed repository for the Media model. */
export class MediaRepository {
  constructor(private readonly db: PrismaClient) {}

  /** Persists a new media record linked to a service order. */
  async create(input: {
    serviceOrderId: string;
    type: 'PHOTO' | 'VIDEO';
    url: string;
    caption?: string;
  }): Promise<MediaRecord> {
    return this.db.media.create({
      data: {
        serviceOrderId: input.serviceOrderId,
        type: input.type,
        url: input.url,
        caption: input.caption ?? null,
      },
    });
  }

  /** Returns all media records for a given service order. */
  async findByServiceOrderId(serviceOrderId: string): Promise<MediaRecord[]> {
    return this.db.media.findMany({
      where: { serviceOrderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Returns a single media record by its ID. */
  async findById(id: string): Promise<MediaRecord | null> {
    return this.db.media.findUnique({ where: { id } });
  }

  /** Deletes a media record by its ID. */
  async delete(id: string): Promise<void> {
    await this.db.media.delete({ where: { id } });
  }
}
