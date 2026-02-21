/**
 * Scoped Prisma client — auto-injects `workshopId` filter into all tenant-scoped queries.
 *
 * Usage:
 * ```ts
 * const db = scopedPrisma(request.tenantId);
 * const customers = await db.customer.findMany(); // auto-filtered
 * ```
 * @module scoped-prisma
 */

import { prisma } from './prisma.js';

/** Models that are scoped by `workshopId` — all others bypass the filter. */
const TENANT_SCOPED_MODELS = new Set(['Customer', 'Vehicle', 'ServiceOrder', 'User']);

/**
 * Returns a Prisma client extension that auto-applies `workshopId` filter
 * to all queries on tenant-scoped models.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function scopedPrisma(tenantId: string) {
  return prisma.$extends({
    query: {
      $allOperations({ args, query, model }) {
        if (!model || !TENANT_SCOPED_MODELS.has(model)) {
          return query(args);
        }

        const argsWithWhere = args as Record<string, unknown>;

        if ('where' in argsWithWhere && typeof argsWithWhere['where'] === 'object') {
          argsWithWhere['where'] = {
            ...(argsWithWhere['where'] as Record<string, unknown>),
            workshopId: tenantId,
          };
        } else if ('data' in argsWithWhere && typeof argsWithWhere['data'] === 'object') {
          argsWithWhere['data'] = {
            ...(argsWithWhere['data'] as Record<string, unknown>),
            workshopId: tenantId,
          };
        }

        return query(args);
      },
    },
  });
}
