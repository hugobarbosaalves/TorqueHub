/**
 * Lookup (Workshop) JSON Schema definitions for Swagger/OpenAPI.
 * @module lookup-schemas
 */
import { successResponse } from '../../../../shared/interfaces/schemas.js';

const workshopSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    document: { type: 'string', nullable: true },
    phone: { type: 'string', nullable: true },
    email: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

/** GET /workshops — List all workshops */
export const listWorkshopsSchema = {
  tags: ['Workshops'],
  summary: 'List all workshops',
  response: {
    200: successResponse({ type: 'array' as const, items: workshopSchema }),
  },
};

/** GET /workshops/:workshopId/customers — List customers for a workshop */
export const listWorkshopCustomersSchema = {
  tags: ['Workshops'],
  summary: 'List customers for a workshop (lookup)',
  params: {
    type: 'object' as const,
    properties: {
      workshopId: { type: 'string', format: 'uuid', description: 'Workshop UUID' },
    },
    required: ['workshopId'],
  },
  response: {
    200: successResponse({
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          document: { type: 'string', nullable: true },
        },
      },
    }),
  },
};

/** GET /workshops/:workshopId/vehicles — List vehicles for a workshop */
export const listWorkshopVehiclesSchema = {
  tags: ['Workshops'],
  summary: 'List vehicles for a workshop (lookup)',
  params: {
    type: 'object' as const,
    properties: {
      workshopId: { type: 'string', format: 'uuid', description: 'Workshop UUID' },
    },
    required: ['workshopId'],
  },
  querystring: {
    type: 'object' as const,
    properties: {
      customerId: { type: 'string', format: 'uuid', description: 'Optional customer filter' },
    },
  },
  response: {
    200: successResponse({
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          id: { type: 'string' },
          plate: { type: 'string' },
          brand: { type: 'string' },
          model: { type: 'string' },
        },
      },
    }),
  },
};
