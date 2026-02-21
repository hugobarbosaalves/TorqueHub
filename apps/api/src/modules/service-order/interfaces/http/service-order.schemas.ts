/**
 * Service Order JSON Schema definitions for Swagger/OpenAPI.
 * @module service-order-schemas
 */
import { ORDER_STATUS_VALUES } from '@torquehub/contracts';
import { successResponse, errorResponse } from '../../../../shared/interfaces/schemas.js';

const orderItemSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'string', format: 'uuid' },
    description: { type: 'string' },
    quantity: { type: 'integer' },
    unitPrice: { type: 'integer', description: 'Price in cents' },
    totalPrice: { type: 'integer', description: 'Total in cents' },
  },
};

const orderSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'string', format: 'uuid' },
    workshopId: { type: 'string', format: 'uuid' },
    customerId: { type: 'string', format: 'uuid' },
    vehicleId: { type: 'string', format: 'uuid' },
    description: { type: 'string' },
    status: {
      type: 'string',
      enum: ORDER_STATUS_VALUES,
    },
    observations: { type: 'string', nullable: true },
    items: { type: 'array', items: orderItemSchema },
    totalAmount: { type: 'integer', description: 'Total in cents' },
    publicToken: { type: 'string', nullable: true },
    customerName: { type: 'string', nullable: true },
    vehiclePlate: { type: 'string', nullable: true },
    vehicleSummary: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

export const createOrderSchema = {
  tags: ['Service Orders'],
  summary: 'Create a new service order',
  body: {
    type: 'object' as const,
    required: ['customerId', 'vehicleId', 'description', 'items'],
    properties: {
      workshopId: { type: 'string', format: 'uuid', description: 'Injected from JWT — optional in body' },
      customerId: { type: 'string', format: 'uuid' },
      vehicleId: { type: 'string', format: 'uuid' },
      description: { type: 'string' },
      items: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['description', 'quantity', 'unitPrice'],
          properties: {
            description: { type: 'string' },
            quantity: { type: 'integer', minimum: 1 },
            unitPrice: { type: 'integer', minimum: 0 },
          },
        },
      },
    },
  },
  response: {
    201: successResponse({
      type: 'object' as const,
      properties: {
        id: { type: 'string', format: 'uuid' },
        status: { type: 'string' },
        publicToken: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    }),
    400: errorResponse,
  },
};

export const listOrdersSchema = {
  tags: ['Service Orders'],
  summary: 'List service orders',
  querystring: {
    type: 'object' as const,
    properties: {
      workshopId: { type: 'string', format: 'uuid', description: 'Filter by workshop' },
    },
  },
  response: { 200: successResponse({ type: 'array' as const, items: orderSchema }) },
};

export const getOrderSchema = {
  tags: ['Service Orders'],
  summary: 'Get service order by ID',
  params: {
    type: 'object' as const,
    properties: { id: { type: 'string', format: 'uuid' } },
    required: ['id'],
  },
  response: { 200: successResponse(orderSchema), 404: errorResponse },
};

export const updateStatusSchema = {
  tags: ['Service Orders'],
  summary: 'Update service order status',
  params: {
    type: 'object' as const,
    properties: { id: { type: 'string', format: 'uuid' } },
    required: ['id'],
  },
  body: {
    type: 'object' as const,
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ORDER_STATUS_VALUES,
      },
    },
  },
  response: {
    200: successResponse({
      type: 'object' as const,
      properties: { id: { type: 'string' }, status: { type: 'string' } },
    }),
    400: errorResponse,
    404: errorResponse,
  },
};

export const deleteOrderSchema = {
  tags: ['Service Orders'],
  summary: 'Delete a service order',
  params: {
    type: 'object' as const,
    properties: { id: { type: 'string', format: 'uuid' } },
    required: ['id'],
  },
  response: {
    200: successResponse({ type: 'object' as const, properties: { deleted: { type: 'boolean' } } }),
    404: errorResponse,
  },
};

export const updateOrderSchema = {
  tags: ['Service Orders'],
  summary: 'Update a DRAFT service order (description, observations, items)',
  params: {
    type: 'object' as const,
    properties: { id: { type: 'string', format: 'uuid' } },
    required: ['id'],
  },
  body: {
    type: 'object' as const,
    properties: {
      description: { type: 'string' },
      observations: { type: 'string' },
      items: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['description', 'quantity', 'unitPrice'],
          properties: {
            description: { type: 'string' },
            quantity: { type: 'integer', minimum: 1 },
            unitPrice: { type: 'integer', minimum: 0 },
          },
        },
      },
    },
  },
  response: {
    200: successResponse(orderSchema),
    400: errorResponse,
    403: errorResponse,
    404: errorResponse,
  },
};
