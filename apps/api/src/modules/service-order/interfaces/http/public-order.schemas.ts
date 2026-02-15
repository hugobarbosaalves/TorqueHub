/**
 * Public Order JSON Schema definitions for Swagger/OpenAPI.
 * Endpoints acessíveis pelo cliente via token público.
 * @module public-order-schemas
 */
import { successResponse, errorResponse } from '../../../../shared/interfaces/schemas.js';

const orderItemSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'string', format: 'uuid' },
    description: { type: 'string' },
    quantity: { type: 'integer' },
    unitPrice: { type: 'integer', description: 'Preço em centavos' },
    totalPrice: { type: 'integer', description: 'Total em centavos' },
  },
};

const publicOrderSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'string', format: 'uuid' },
    workshopId: { type: 'string', format: 'uuid' },
    customerId: { type: 'string', format: 'uuid' },
    vehicleId: { type: 'string', format: 'uuid' },
    description: { type: 'string' },
    status: {
      type: 'string',
      enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    },
    observations: { type: 'string', nullable: true },
    items: { type: 'array', items: orderItemSchema },
    totalAmount: { type: 'integer', description: 'Total em centavos' },
    publicToken: { type: 'string', nullable: true },
    vehicle: {
      type: 'object',
      properties: {
        plate: { type: 'string' },
        brand: { type: 'string' },
        model: { type: 'string' },
        year: { type: 'integer', nullable: true },
        color: { type: 'string', nullable: true },
      },
    },
    customerName: { type: 'string' },
    media: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['PHOTO', 'VIDEO'] },
          url: { type: 'string' },
          caption: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

/** Schema: buscar ordem pelo token público. */
export const getOrderByTokenSchema = {
  tags: ['Public'],
  summary: 'Busca uma ordem de serviço pelo token público',
  description: 'Endpoint público para o cliente consultar sua ordem de serviço via link/token.',
  params: {
    type: 'object' as const,
    properties: {
      token: { type: 'string', description: 'Token público da ordem' },
    },
    required: ['token'],
  },
  response: {
    200: successResponse(publicOrderSchema),
    404: errorResponse,
  },
};

/** Schema: histórico de ordens do veículo via token público. */
export const getVehicleHistorySchema = {
  tags: ['Public'],
  summary: 'Histórico de serviços do veículo via token público',
  description:
    'Busca todas as ordens de serviço do veículo vinculado à ordem identificada pelo token.',
  params: {
    type: 'object' as const,
    properties: {
      token: { type: 'string', description: 'Token público da ordem' },
    },
    required: ['token'],
  },
  response: {
    200: successResponse({
      type: 'array' as const,
      items: publicOrderSchema,
    }),
    404: errorResponse,
  },
};
