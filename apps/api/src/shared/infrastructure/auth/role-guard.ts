/**
 * Role guard — Fastify preHandler that restricts access by user role.
 *
 * Usage:
 * ```ts
 * app.get('/admin/workshops', {
 *   onRequest: [requireRole('PLATFORM_ADMIN')],
 *   handler: listWorkshopsHandler,
 * });
 * ```
 * @module role-guard
 */

import type { FastifyReply, FastifyRequest } from 'fastify';
import type { UserRole } from '@torquehub/contracts';

/**
 * Returns a preHandler hook that rejects requests from users
 * whose role is not in the `allowed` list.
 */
export function requireRole(...allowed: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userRole = request.user?.role as UserRole | undefined;

    if (!userRole || !allowed.includes(userRole)) {
      return reply.status(403).send({
        success: false,
        data: null,
        meta: { error: 'Forbidden — insufficient role' },
      });
    }
  };
}
