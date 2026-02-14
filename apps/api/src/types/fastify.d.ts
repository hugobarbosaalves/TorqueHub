/**
 * Type augmentation for Fastify — adds `authenticate` decorator and JWT user payload.
 * @module fastify-types
 */

import type { FastifyReply, FastifyRequest } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    /** Pre-handler hook that verifies JWT and populates `request.user`. */
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string;
      workshopId: string;
      role: string;
    };
    user: {
      sub: string;
      workshopId: string;
      role: string;
    };
  }
}
