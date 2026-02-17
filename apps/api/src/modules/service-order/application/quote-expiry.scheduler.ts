/**
 * Rotina de expiração automática de orçamentos.
 * Cancela ordens DRAFT com quoteExpiresAt expirado.
 * Roda a cada 6 horas via setInterval.
 * @module quote-expiry-scheduler
 */
import type { FastifyBaseLogger } from 'fastify';
import { prisma } from '../../../shared/infrastructure/database/prisma.js';
import { ServiceOrderRepository } from '../infrastructure/repositories/service-order.repository.js';
import { ExpireStaleQuotesUseCase } from './use-cases/quote-pdf.use-case.js';

const INTERVAL_MS = 6 * 60 * 60 * 1000;
let intervalId: ReturnType<typeof setInterval> | null = null;

const repo = new ServiceOrderRepository(prisma);
const expireUseCase = new ExpireStaleQuotesUseCase(repo);

/** Executa uma rodada de expiração de orçamentos. */
async function runExpiration(logger: FastifyBaseLogger): Promise<void> {
  try {
    const count = await expireUseCase.execute();
    if (count > 0) {
      logger.info(`[quote-expiry] ${String(count)} orçamento(s) DRAFT expirado(s) e cancelado(s).`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    logger.error(`[quote-expiry] Falha ao expirar orçamentos: ${message}`);
  }
}

/** Inicia o scheduler de expiração de orçamentos. */
export function startQuoteExpiryScheduler(logger: FastifyBaseLogger): void {
  runExpiration(logger);
  intervalId = setInterval(() => {
    runExpiration(logger);
  }, INTERVAL_MS);
}

/** Para o scheduler (útil para testes). */
export function stopQuoteExpiryScheduler(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
