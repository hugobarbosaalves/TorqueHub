/**
 * Vehicle JSON Schema definitions for Swagger/OpenAPI.
 * @module vehicle-schemas
 */
import {
  successResponse,
  errorResponse,
  idParam,
  vehicleSchema,
  createVehicleBody,
  updateVehicleBody,
} from '../../../../shared/interfaces/schemas.js';

/** POST /vehicles — Create a new vehicle */
export const createVehicleSchema = {
  tags: ['Vehicles'],
  summary: 'Create a new vehicle',
  body: createVehicleBody,
  response: { 201: successResponse(vehicleSchema), 400: errorResponse },
};

/** GET /vehicles — List vehicles */
export const listVehiclesSchema = {
  tags: ['Vehicles'],
  summary: 'List vehicles by workshop or customer',
  querystring: {
    type: 'object' as const,
    properties: {
      workshopId: { type: 'string', format: 'uuid', description: 'Filter by workshop' },
      customerId: { type: 'string', format: 'uuid', description: 'Filter by customer' },
    },
  },
  response: {
    200: successResponse({ type: 'array' as const, items: vehicleSchema }),
    400: errorResponse,
  },
};

/** GET /vehicles/:id — Get vehicle by ID */
export const getVehicleSchema = {
  tags: ['Vehicles'],
  summary: 'Get vehicle by ID',
  params: idParam,
  response: { 200: successResponse(vehicleSchema), 404: errorResponse },
};

/** PUT /vehicles/:id — Update a vehicle */
export const updateVehicleSchema = {
  tags: ['Vehicles'],
  summary: 'Update a vehicle',
  params: idParam,
  body: updateVehicleBody,
  response: { 200: successResponse(vehicleSchema), 404: errorResponse },
};

/** DELETE /vehicles/:id — Delete a vehicle */
export const deleteVehicleSchema = {
  tags: ['Vehicles'],
  summary: 'Delete a vehicle',
  params: idParam,
  response: {
    200: successResponse({ type: 'object' as const, properties: { deleted: { type: 'boolean' } } }),
    404: errorResponse,
  },
};

/** GET /vehicles/lookup/:plate — Lookup vehicle info by plate */
export const plateLookupSchema = {
  tags: ['Vehicles'],
  summary: 'Busca informações de veículo pela placa (API externa)',
  description: 'Consulta dados públicos do veículo pela placa brasileira.',
  params: {
    type: 'object' as const,
    properties: {
      plate: { type: 'string', description: 'Placa do veículo (ABC1D23 ou ABC-1234)' },
    },
    required: ['plate'],
  },
  response: {
    200: successResponse({
      type: 'object' as const,
      properties: {
        brand: { type: 'string' },
        model: { type: 'string' },
        year: { type: 'integer', nullable: true },
        color: { type: 'string', nullable: true },
      },
    }),
    404: errorResponse,
    400: errorResponse,
  },
};
