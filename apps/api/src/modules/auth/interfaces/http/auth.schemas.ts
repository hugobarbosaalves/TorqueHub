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
    workshopId: { type: 'string', format: 'uuid', nullable: true },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    role: { type: 'string', enum: ['PLATFORM_ADMIN', 'WORKSHOP_OWNER', 'MECHANIC'] },
    mustChangePassword: { type: 'boolean' },
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
  description: 'Cria um novo usuário. workshopId obrigatório para WORKSHOP_OWNER e MECHANIC.',
  body: {
    type: 'object' as const,
    required: ['name', 'email', 'password'],
    properties: {
      workshopId: {
        type: 'string',
        format: 'uuid',
        description: 'Obrigatório exceto para PLATFORM_ADMIN',
      },
      name: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 },
      role: { type: 'string', enum: ['PLATFORM_ADMIN', 'WORKSHOP_OWNER', 'MECHANIC'] },
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

/** PATCH /auth/change-password */
export const changePasswordSchema = {
  tags: ['Auth'],
  summary: 'Alterar senha do usuário autenticado',
  description: 'Altera a senha do usuário logado. Requer a senha atual para validação.',
  security: [{ bearerAuth: [] }],
  body: {
    type: 'object' as const,
    required: ['currentPassword', 'newPassword'],
    properties: {
      currentPassword: { type: 'string', description: 'Senha atual do usuário' },
      newPassword: {
        type: 'string',
        minLength: 6,
        description: 'Nova senha (mínimo 6 caracteres)',
      },
    },
  },
  response: {
    200: successResponse(userSchema),
    400: errorResponse,
    401: errorResponse,
  },
};
