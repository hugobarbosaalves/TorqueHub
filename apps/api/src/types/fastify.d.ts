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
      workshopId: string | null;
      role: 'PLATFORM_ADMIN' | 'WORKSHOP_OWNER' | 'MECHANIC';
    };
    user: {
      sub: string;
      workshopId: string | null;
      role: 'PLATFORM_ADMIN' | 'WORKSHOP_OWNER' | 'MECHANIC';
    };
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    /** Tenant ID injected by tenant-context middleware. null for PLATFORM_ADMIN without ?workshopId. */
    tenantId: string | null;
  }
}
