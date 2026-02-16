/**
 * Shared formatting utilities for the web app.
 *
 * Centralizes `currency` and `formatDate` used across multiple components,
 * eliminating duplication in OrderItems and VehicleHistory.
 * @module format
 */

/** Formats an amount in centavos as BRL currency. */
export function currency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Formats an ISO date string to pt-BR locale date. */
export function formatDateBR(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

/** Formats an ISO date string to pt-BR long date (e.g. "15 de fevereiro de 2026"). */
export function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}
