/**
 * Admin Swagger schemas — JSON Schema definitions for admin endpoints.
 * @module admin-schemas
 */

const workshopProperties = {
  id: { type: 'string', format: 'uuid' },
  name: { type: 'string' },
  document: { type: 'string' },
  phone: { type: 'string', nullable: true },
  email: { type: 'string', nullable: true },
  address: { type: 'string', nullable: true },
  createdAt: { type: 'string', format: 'date-time' },
  updatedAt: { type: 'string', format: 'date-time' },
} as const;

const userProperties = {
  id: { type: 'string', format: 'uuid' },
  workshopId: { type: 'string', format: 'uuid', nullable: true },
  name: { type: 'string' },
  email: { type: 'string', format: 'email' },
  role: { type: 'string', enum: ['PLATFORM_ADMIN', 'WORKSHOP_OWNER', 'MECHANIC'] },
  mustChangePassword: { type: 'boolean' },
  createdAt: { type: 'string', format: 'date-time' },
} as const;

const metricsProperties = {
  totalWorkshops: { type: 'number' },
  totalUsers: { type: 'number' },
  totalServiceOrders: { type: 'number' },
  totalCustomers: { type: 'number' },
} as const;

/** GET /admin/workshops — list all workshops. */
export const listWorkshopsSchema = {
  tags: ['Admin'],
  summary: 'Lista todas as oficinas (PLATFORM_ADMIN)',
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: { type: 'object', properties: workshopProperties },
        },
        meta: { type: 'object', properties: { total: { type: 'number' } } },
      },
    },
  },
};

/** POST /admin/workshops — create a workshop. */
export const createWorkshopSchema = {
  tags: ['Admin'],
  summary: 'Cria uma nova oficina (PLATFORM_ADMIN)',
  body: {
    type: 'object',
    required: ['name', 'document'],
    properties: {
      name: { type: 'string' },
      document: { type: 'string' },
      phone: { type: 'string' },
      email: { type: 'string', format: 'email' },
      address: { type: 'string' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object', properties: workshopProperties },
      },
    },
  },
};

/** GET /admin/workshops/:id — get a workshop by ID. */
export const getWorkshopSchema = {
  tags: ['Admin'],
  summary: 'Busca uma oficina pelo ID (PLATFORM_ADMIN)',
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string', format: 'uuid' } },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object', properties: workshopProperties },
      },
    },
  },
};

/** PATCH /admin/workshops/:id — update a workshop. */
export const updateWorkshopSchema = {
  tags: ['Admin'],
  summary: 'Atualiza uma oficina (PLATFORM_ADMIN)',
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string', format: 'uuid' } },
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      document: { type: 'string' },
      phone: { type: 'string' },
      email: { type: 'string', format: 'email' },
      address: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object', properties: workshopProperties },
      },
    },
  },
};

/** GET /admin/workshops/:id/users — list users of a workshop. */
export const listWorkshopUsersSchema = {
  tags: ['Admin'],
  summary: 'Lista usuários de uma oficina (PLATFORM_ADMIN / WORKSHOP_OWNER própria)',
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string', format: 'uuid' } },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: { type: 'object', properties: userProperties },
        },
        meta: { type: 'object', properties: { total: { type: 'number' } } },
      },
    },
  },
};

/** POST /admin/workshops/:id/users — create a user within a workshop. */
export const createWorkshopUserSchema = {
  tags: ['Admin'],
  summary: 'Cria um usuário vinculado a uma oficina (PLATFORM_ADMIN / WORKSHOP_OWNER própria)',
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string', format: 'uuid' } },
  },
  body: {
    type: 'object',
    required: ['name', 'email', 'password', 'role'],
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 },
      role: { type: 'string', enum: ['WORKSHOP_OWNER', 'MECHANIC'] },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object', properties: userProperties },
      },
    },
  },
};

/** GET /admin/metrics — platform-wide aggregate metrics. */
export const getMetricsSchema = {
  tags: ['Admin'],
  summary: 'Métricas globais da plataforma (PLATFORM_ADMIN)',
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'object', properties: metricsProperties },
      },
    },
  },
};
