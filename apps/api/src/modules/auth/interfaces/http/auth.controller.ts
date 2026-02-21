/**
 * Auth controller — HTTP routes for login, register, and profile.
 * Registered under `/auth`.
 * @module auth-controller
 */

import type { FastifyInstance } from 'fastify';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  UserDTO,
} from '@torquehub/contracts';
import { prisma } from '../../../../shared/infrastructure/database/prisma.js';
import { UserRepository } from '../../infrastructure/repositories/user.repository.js';
import {
  LoginUseCase,
  RegisterUseCase,
  GetProfileUseCase,
  ChangePasswordUseCase,
} from '../../application/use-cases/auth.use-case.js';
import {
  loginSchema,
  registerSchema,
  profileSchema,
  changePasswordSchema,
} from './auth.schemas.js';

const userRepo = new UserRepository(prisma);

/** Registers authentication routes. */
export function authRoutes(app: FastifyInstance): void {
  const loginUseCase = new LoginUseCase(userRepo, (payload) =>
    app.jwt.sign(payload, { expiresIn: '7d' }),
  );
  const registerUseCase = new RegisterUseCase(userRepo);
  const profileUseCase = new GetProfileUseCase(userRepo);
  const changePasswordUseCase = new ChangePasswordUseCase(userRepo);

  /** Login — retorna JWT + dados do usuário. */
  app.post<{ Body: LoginRequest; Reply: ApiResponse<AuthResponse> }>(
    '/login',
    { schema: loginSchema },
    async (request, reply) => {
      const { email, password } = request.body;

      const result = await loginUseCase.execute(email, password);
      if (!result) {
        return reply.status(401).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Invalid email or password' },
        });
      }

      return reply.send({ success: true, data: result });
    },
  );

  /** Register — cria um novo usuário. */
  app.post<{ Body: RegisterRequest; Reply: ApiResponse<UserDTO> }>(
    '/register',
    { schema: registerSchema },
    async (request, reply) => {
      try {
        const user = await registerUseCase.execute(request.body);
        return await reply.status(201).send({ success: true, data: user });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Registration failed';
        return reply.status(400).send({
          success: false,
          data: undefined as never,
          meta: { error: message },
        });
      }
    },
  );

  /** Profile — dados do usuário autenticado (requer JWT). */
  app.get<{ Reply: ApiResponse<UserDTO> }>(
    '/me',
    { schema: profileSchema, onRequest: [app.authenticate] },
    async (request, reply) => {
      const { sub } = request.user;
      const user = await profileUseCase.execute(sub);

      if (!user) {
        return reply.status(401).send({
          success: false,
          data: undefined as never,
          meta: { error: 'User not found' },
        });
      }

      return reply.send({ success: true, data: user });
    },
  );

  /** Change Password — altera a senha do usuário autenticado. */
  app.patch<{ Body: ChangePasswordRequest; Reply: ApiResponse<UserDTO> }>(
    '/change-password',
    { schema: changePasswordSchema, onRequest: [app.authenticate] },
    async (request, reply) => {
      const { currentPassword, newPassword } = request.body;

      try {
        const user = await changePasswordUseCase.execute(
          request.user.sub,
          currentPassword,
          newPassword,
        );
        return await reply.send({ success: true, data: user });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to change password';
        const status = message.includes('incorrect') ? 401 : 400;
        return reply.status(status).send({
          success: false,
          data: undefined as never,
          meta: { error: message },
        });
      }
    },
  );
}
