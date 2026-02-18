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
