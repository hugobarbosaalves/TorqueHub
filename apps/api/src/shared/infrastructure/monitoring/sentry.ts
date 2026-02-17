/**
 * Sentry — error tracking initialization.
 * Carregado no início do server.ts antes de qualquer outro import.
 * @module sentry
 */
import * as Sentry from '@sentry/node';

const SENTRY_DSN = process.env['SENTRY_DSN'] ?? '';

/** Inicializa o Sentry se o DSN estiver configurado. */
export function initSentry(): void {
  if (!SENTRY_DSN) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env['NODE_ENV'] ?? 'development',
    tracesSampleRate: 0.2,
    profilesSampleRate: 0.1,
  });
}

export { Sentry };
