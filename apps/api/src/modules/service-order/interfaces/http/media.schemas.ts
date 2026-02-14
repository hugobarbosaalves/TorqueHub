/**
 * Media route JSON Schemas — Swagger/OpenAPI definitions for media endpoints.
 * @module media-schemas
 */

import { successResponse, errorResponse } from '../../../../shared/interfaces/schemas.js';

const mediaSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'string', format: 'uuid' },
    serviceOrderId: { type: 'string', format: 'uuid' },
    type: { type: 'string', enum: ['PHOTO', 'VIDEO'] },
    url: { type: 'string' },
    caption: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

export const uploadMediaSchema = {
  tags: ['Media'],
  summary: 'Upload a photo or video for a service order',
  description: 'Accepts multipart/form-data with a file field and optional caption.',
  consumes: ['multipart/form-data'],
  params: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', format: 'uuid', description: 'Service order ID' },
    },
    required: ['id'],
  },
  response: {
    201: successResponse({
      type: 'object' as const,
      properties: {
        id: { type: 'string', format: 'uuid' },
        type: { type: 'string', enum: ['PHOTO', 'VIDEO'] },
        url: { type: 'string' },
        caption: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    }),
    400: errorResponse,
    404: errorResponse,
  },
};

export const listMediaSchema = {
  tags: ['Media'],
  summary: 'List all media for a service order',
  params: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', format: 'uuid', description: 'Service order ID' },
    },
    required: ['id'],
  },
  response: {
    200: successResponse({ type: 'array' as const, items: mediaSchema }),
    404: errorResponse,
  },
};

export const deleteMediaSchema = {
  tags: ['Media'],
  summary: 'Delete a media file',
  params: {
    type: 'object' as const,
    properties: {
      id: { type: 'string', format: 'uuid', description: 'Service order ID' },
      mediaId: { type: 'string', format: 'uuid', description: 'Media ID' },
    },
    required: ['id', 'mediaId'],
  },
  response: {
    200: successResponse({
      type: 'object' as const,
      properties: { deleted: { type: 'boolean' } },
    }),
    404: errorResponse,
  },
};
