/**
 * Customer JSON Schema definitions for Swagger/OpenAPI.
 * @module customer-schemas
 */
import {
  successResponse,
  errorResponse,
  idParam,
  customerSchema,
  createCustomerBody,
  updateCustomerBody,
} from '../../../../shared/interfaces/schemas.js';

/** POST /customers — Create a new customer */
export const createCustomerSchema = {
  tags: ['Customers'],
  summary: 'Create a new customer',
  body: createCustomerBody,
  response: { 201: successResponse(customerSchema), 400: errorResponse },
};

/** GET /customers — List customers by workshop */
export const listCustomersSchema = {
  tags: ['Customers'],
  summary: 'List customers by workshop',
  querystring: {
    type: 'object' as const,
    required: ['workshopId'],
    properties: {
      workshopId: { type: 'string', format: 'uuid', description: 'Workshop ID filter' },
    },
  },
  response: {
    200: successResponse({ type: 'array' as const, items: customerSchema }),
    400: errorResponse,
  },
};

/** GET /customers/:id — Get customer by ID */
export const getCustomerSchema = {
  tags: ['Customers'],
  summary: 'Get customer by ID',
  params: idParam,
  response: { 200: successResponse(customerSchema), 404: errorResponse },
};

/** PUT /customers/:id — Update a customer */
export const updateCustomerSchema = {
  tags: ['Customers'],
  summary: 'Update a customer',
  params: idParam,
  body: updateCustomerBody,
  response: { 200: successResponse(customerSchema), 404: errorResponse },
};

/** DELETE /customers/:id — Delete a customer */
export const deleteCustomerSchema = {
  tags: ['Customers'],
  summary: 'Delete a customer',
  params: idParam,
  response: {
    200: successResponse({ type: 'object' as const, properties: { deleted: { type: 'boolean' } } }),
    404: errorResponse,
  },
};
