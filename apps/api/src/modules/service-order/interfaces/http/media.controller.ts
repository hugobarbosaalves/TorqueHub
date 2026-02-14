/**
 * Media controller — HTTP routes for uploading, listing, and deleting media.
 * Registered under `/service-orders/:id/media`.
 * @module media-controller
 */

import { existsSync, mkdirSync } from 'node:fs';
import { writeFile, unlink } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import type { ApiResponse, MediaDTO, UploadMediaResponse } from '@torquehub/contracts';
import { prisma } from '../../../../shared/infrastructure/database/prisma.js';
import { ServiceOrderRepository } from '../../infrastructure/repositories/service-order.repository.js';
import { MediaRepository } from '../../infrastructure/repositories/media.repository.js';
import { UploadMediaUseCase, ListMediaUseCase, DeleteMediaUseCase } from '../../application/use-cases/media.use-case.js';
import { uploadMediaSchema, listMediaSchema, deleteMediaSchema } from './media.schemas.js';

const UPLOADS_DIR = join(process.cwd(), 'uploads');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.avi', '.webm']);
const ALLOWED_EXTENSIONS = new Set([...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS]);
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const orderRepo = new ServiceOrderRepository(prisma);
const mediaRepo = new MediaRepository(prisma);
const uploadUseCase = new UploadMediaUseCase(mediaRepo);
const listUseCase = new ListMediaUseCase(mediaRepo);
const deleteUseCase = new DeleteMediaUseCase(mediaRepo);

/** Ensures the uploads directory exists. */
function ensureUploadsDir(): void {
  if (!existsSync(UPLOADS_DIR)) {
    mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

/** Resolves media type from file extension. */
function resolveMediaType(ext: string): 'PHOTO' | 'VIDEO' {
  return VIDEO_EXTENSIONS.has(ext.toLowerCase()) ? 'VIDEO' : 'PHOTO';
}

/** Registers media routes for a service order. */
export function mediaRoutes(app: FastifyInstance): void {
  ensureUploadsDir();

  app.post<{ Params: { id: string }; Reply: ApiResponse<UploadMediaResponse> }>(
    '/:id/media',
    { schema: uploadMediaSchema },
    async (request, reply) => {
      const { id } = request.params;

      const order = await orderRepo.findById(id);
      if (!order) {
        return reply.status(404).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Service order not found' },
        });
      }

      const data = await request.file();
      if (!data) {
        return reply.status(400).send({
          success: false,
          data: undefined as never,
          meta: { error: 'No file uploaded. Send a multipart form with a "file" field.' },
        });
      }

      const ext = extname(data.filename).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return reply.status(400).send({
          success: false,
          data: undefined as never,
          meta: { error: `File type "${ext}" not allowed. Use: ${[...ALLOWED_EXTENSIONS].join(', ')}` },
        });
      }

      const buffer = await data.toBuffer();
      if (buffer.length > MAX_FILE_SIZE) {
        return reply.status(400).send({
          success: false,
          data: undefined as never,
          meta: { error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024} MB` },
        });
      }

      const filename = `${randomUUID()}${ext}`;
      const filepath = join(UPLOADS_DIR, filename);
      await writeFile(filepath, buffer);

      const type = resolveMediaType(ext);
      const url = `/uploads/${filename}`;
      const captionValue = data.fields['caption']
        ? String((data.fields['caption'] as { value?: string }).value ?? '')
        : null;

      const result = await uploadUseCase.execute({
        serviceOrderId: id,
        type,
        url,
        ...(captionValue ? { caption: captionValue } : {}),
      });

      return reply.status(201).send({ success: true, data: result });
    },
  );

  app.get<{ Params: { id: string }; Reply: ApiResponse<MediaDTO[]> }>(
    '/:id/media',
    { schema: listMediaSchema },
    async (request, reply) => {
      const { id } = request.params;

      const order = await orderRepo.findById(id);
      if (!order) {
        return reply.status(404).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Service order not found' },
        });
      }

      const media = await listUseCase.execute(id);
      return reply.send({ success: true, data: media, meta: { total: media.length } });
    },
  );

  app.delete<{ Params: { id: string; mediaId: string }; Reply: ApiResponse<{ deleted: boolean }> }>(
    '/:id/media/:mediaId',
    { schema: deleteMediaSchema },
    async (request, reply) => {
      const { mediaId } = request.params;

      const record = await mediaRepo.findById(mediaId);
      if (!record) {
        return reply.status(404).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Media not found' },
        });
      }

      const filename = record.url.replaceAll('/uploads/', '');
      const filepath = join(UPLOADS_DIR, filename);
      try {
        await unlink(filepath);
      } catch {
        // File may already be deleted from disk — continue with DB cleanup.
      }

      await deleteUseCase.execute(mediaId);
      return reply.send({ success: true, data: { deleted: true } });
    },
  );
}
