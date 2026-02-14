/**
 * Auth JSON Schema definitions for Swagger/OpenAPI documentation.
 * @module auth-schemas
 */

import { successResponse, errorResponse } from '../../../../shared/interfaces/schemas.js';

/** Schema de representação de um usuário (sem senha). */
const userSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'string', format: 'uuid' },
    workshopId: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    role: { type: 'string', enum: ['ADMIN', 'MECHANIC'] },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

/** Schema de resposta de autenticação (token + user). */
const authResponseSchema = {
  type: 'object' as const,
  properties: {
    token: { type: 'string' },
    user: userSchema,
  },
};

/** POST /auth/login */
export const loginSchema = {
  tags: ['Auth'],
  summary: 'Autenticar usuário',
  description: 'Realiza login com email e senha. Retorna JWT + dados do usuário.',
  body: {
    type: 'object' as const,
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', description: 'Email do usuário' },
      password: { type: 'string', minLength: 6, description: 'Senha do usuário' },
    },
  },
  response: {
    200: successResponse(authResponseSchema),
    401: errorResponse,
  },
};

/** POST /auth/register */
export const registerSchema = {
  tags: ['Auth'],
  summary: 'Registrar novo usuário',
  description: 'Cria um novo usuário vinculado a uma oficina.',
  body: {
    type: 'object' as const,
    required: ['workshopId', 'name', 'email', 'password'],
    properties: {
      workshopId: { type: 'string', format: 'uuid' },
      name: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 },
      role: { type: 'string', enum: ['ADMIN', 'MECHANIC'] },
    },
  },
  response: {
    201: successResponse(userSchema),
    400: errorResponse,
  },
};

/** GET /auth/me */
export const profileSchema = {
  tags: ['Auth'],
  summary: 'Perfil do usuário autenticado',
  description: 'Retorna os dados do usuário logado (requer token JWT).',
  security: [{ bearerAuth: [] }],
  response: {
    200: successResponse(userSchema),
    401: errorResponse,
  },
};
