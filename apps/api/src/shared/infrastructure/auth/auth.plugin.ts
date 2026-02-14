/**
 * JWT authentication plugin — registers `app.jwt` and `app.authenticate` decorator.
 *
 * - `app.jwt.sign(payload)` — creates a signed token
 * - `app.authenticate` — preHandler hook that verifies the JWT
 *
 * Public routes (e.g. /public/*, /auth/login, /auth/register) skip authentication.
 * @module auth-plugin
 */

import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'torquehub-dev-secret-change-in-production';

async function authPlugin(app: FastifyInstance): Promise<void> {
  await app.register(fastifyJwt, { secret: JWT_SECRET });

  /** Decorator: verifies JWT and attaches `request.user`. */
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({
        success: false,
        data: null,
        meta: { error: 'Unauthorized — invalid or missing token' },
      });
    }
  });
}

export default fp(authPlugin, { name: 'auth-plugin' });
