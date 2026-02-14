/**
 * Media use cases — upload, list, and delete media for service orders.
 * @module media-use-cases
 */

import type { MediaDTO, UploadMediaResponse } from '@torquehub/contracts';
import type { MediaRecord } from '../../infrastructure/repositories/media.repository.js';
import { MediaRepository } from '../../infrastructure/repositories/media.repository.js';

/** Maps a database media record to a DTO. */
function toDTO(media: MediaRecord): MediaDTO {
  return {
    id: media.id,
    serviceOrderId: media.serviceOrderId,
    type: media.type as MediaDTO['type'],
    url: media.url,
    caption: media.caption,
    createdAt: media.createdAt.toISOString(),
  };
}

/** Uploads a new media file and persists the metadata. */
export class UploadMediaUseCase {
  constructor(private readonly repo: MediaRepository) {}

  /** Creates a media record after the file has been saved to disk. */
  async execute(input: {
    serviceOrderId: string;
    type: 'PHOTO' | 'VIDEO';
    url: string;
    caption?: string;
  }): Promise<UploadMediaResponse> {
    const media = await this.repo.create(input);
    return {
      id: media.id,
      type: media.type as UploadMediaResponse['type'],
      url: media.url,
      caption: media.caption,
      createdAt: media.createdAt.toISOString(),
    };
  }
}

/** Lists all media for a given service order. */
export class ListMediaUseCase {
  constructor(private readonly repo: MediaRepository) {}

  async execute(serviceOrderId: string): Promise<MediaDTO[]> {
    const records = await this.repo.findByServiceOrderId(serviceOrderId);
    return records.map(toDTO);
  }
}

/** Deletes a media record and returns whether it existed. */
export class DeleteMediaUseCase {
  constructor(private readonly repo: MediaRepository) {}

  /** Returns true if deleted, false if not found. */
  async execute(mediaId: string): Promise<boolean> {
    const existing = await this.repo.findById(mediaId);
    if (!existing) return false;
    await this.repo.delete(mediaId);
    return true;
  }
}
