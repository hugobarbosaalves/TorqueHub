/**
 * Shared JSON Schema definitions for Swagger/OpenAPI documentation.
 * Used by all controller route schemas to maintain consistency.
 * @module schemas
 */

/** Standard success response wrapper schema. */
export function successResponse(dataSchema: Record<string, unknown>): Record<string, unknown> {
  return {
    type: 'object' as const,
    properties: {
      success: { type: 'boolean', enum: [true] },
      data: dataSchema,
      meta: { type: 'object', additionalProperties: true },
    },
  };
}

/** Standard error response schema. */
export const errorResponse = {
  type: 'object' as const,
  properties: {
    success: { type: 'boolean', enum: [false] },
    data: {},
    meta: {
      type: 'object',
      properties: { error: { type: 'string' } },
    },
  },
};

/** UUID path parameter schema. */
export const idParam = {
  type: 'object' as const,
  properties: {
    id: { type: 'string', format: 'uuid', description: 'Resource UUID' },
  },
  required: ['id'],
};

/** Schema de representação de um cliente. */
export const customerSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'string', format: 'uuid' },
    workshopId: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    document: { type: 'string', nullable: true },
    phone: { type: 'string', nullable: true },
    email: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

export const createCustomerBody = {
  type: 'object' as const,
  required: ['workshopId', 'name'],
  properties: {
    workshopId: { type: 'string', format: 'uuid' },
    name: { type: 'string', minLength: 1 },
    document: { type: 'string' },
    phone: { type: 'string' },
    email: { type: 'string', format: 'email' },
  },
};

export const updateCustomerBody = {
  type: 'object' as const,
  properties: {
    name: { type: 'string' },
    document: { type: 'string' },
    phone: { type: 'string' },
    email: { type: 'string', format: 'email' },
  },
};

/** Schema de representação de um veículo. */
export const vehicleSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'string', format: 'uuid' },
    workshopId: { type: 'string', format: 'uuid' },
    customerId: { type: 'string', format: 'uuid' },
    plate: { type: 'string' },
    brand: { type: 'string' },
    model: { type: 'string' },
    year: { type: 'integer', nullable: true },
    color: { type: 'string', nullable: true },
    mileage: { type: 'integer', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

export const createVehicleBody = {
  type: 'object' as const,
  required: ['workshopId', 'customerId', 'plate', 'brand', 'model'],
  properties: {
    workshopId: { type: 'string', format: 'uuid' },
    customerId: { type: 'string', format: 'uuid' },
    plate: { type: 'string' },
    brand: { type: 'string' },
    model: { type: 'string' },
    year: { type: 'integer' },
    color: { type: 'string' },
    mileage: { type: 'integer' },
  },
};

export const updateVehicleBody = {
  type: 'object' as const,
  properties: {
    plate: { type: 'string' },
    brand: { type: 'string' },
    model: { type: 'string' },
    year: { type: 'integer' },
    color: { type: 'string' },
    mileage: { type: 'integer' },
  },
};
