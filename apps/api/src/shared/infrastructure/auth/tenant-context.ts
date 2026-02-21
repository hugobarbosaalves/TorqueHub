/**
 * Tenant context middleware — injects `request.tenantId` based on JWT role.
 *
 * - PLATFORM_ADMIN: tenantId comes from `?workshopId=` query param (optional).
 * - WORKSHOP_OWNER / MECHANIC: tenantId is forced from JWT `workshopId` claim.
 *
 * This middleware runs AFTER JWT verification (global hook).
 * @module tenant-context
 */

import type { FastifyInstance } from 'fastify';
import { USER_ROLE } from '@torquehub/contracts';

/** Registers the tenant context hook on the Fastify instance. */
export function registerTenantContext(app: FastifyInstance): void {
  app.addHook('onRequest', async (request) => {
    if (!request.user) {
      request.tenantId = null;
      return;
    }

    const { role, workshopId } = request.user;

    if (role === USER_ROLE.PLATFORM_ADMIN) {
      const query = request.query as Record<string, string | undefined>;
      request.tenantId = query['workshopId'] ?? null;
    } else {
      request.tenantId = workshopId;
    }
  });
}
