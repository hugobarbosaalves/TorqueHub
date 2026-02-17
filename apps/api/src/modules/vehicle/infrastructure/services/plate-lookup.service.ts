/**
 * Plate lookup service — consulta dados de veículo por placa.
 *
 * Usa a Brasil API (gratuita) como fonte de dados.
 * Fallback gracioso: retorna null se indisponível.
 * @module plate-lookup-service
 */
import type { PlateLookupResult } from '../../domain/types.js';
import { isValidBrazilianPlate } from '../../domain/constants.js';

const BRASIL_API_PLATES = 'https://brasilapi.com.br/api/fipe/placas/v1';

/** Timeout para chamadas externas (5s). */
const FETCH_TIMEOUT_MS = 5_000;

/**
 * Normaliza a placa para o formato sem traço e maiúscula.
 * Ex: "abc-1d23" → "ABC1D23"
 */
function normalizePlate(raw: string): string {
  return raw.toUpperCase().replaceAll(/[^A-Z0-9]/g, '');
}

/**
 * Capitaliza cada palavra de uma string.
 * Ex: "FIAT ARGO" → "Fiat Argo"
 */
function capitalizeWords(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => (word.length > 0 ? `${word[0]?.toUpperCase() ?? ''}${word.slice(1)}` : ''))
    .join(' ');
}

/**
 * Consulta dados de um veículo por placa usando a API pública.
 *
 * Tenta múltiplas fontes de dados. Retorna null se não encontrar.
 */
export async function lookupPlate(raw: string): Promise<PlateLookupResult | null> {
  const plate = normalizePlate(raw);
  if (!isValidBrazilianPlate(plate)) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, FETCH_TIMEOUT_MS);

    const response = await fetch(`${BRASIL_API_PLATES}/${plate}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const data = (await response.json()) as Record<string, unknown>;

    const brand = typeof data['marca'] === 'string' ? capitalizeWords(data['marca']) : '';
    const model = typeof data['modelo'] === 'string' ? capitalizeWords(data['modelo']) : '';
    const yearRaw = data['ano'] ?? data['anoModelo'];
    const year =
      typeof yearRaw === 'number' ? yearRaw : Number.parseInt(String(yearRaw), 10) || null;
    const color = typeof data['cor'] === 'string' ? capitalizeWords(data['cor']) : null;

    if (!brand && !model) return null;

    return { brand, model, year, color };
  } catch {
    return null;
  }
}
