/**
 * Plate lookup service — consulta dados de veículo por placa.
 *
 * Estratégia:
 * - Com PLATE_LOOKUP_TOKEN → usa API real (apiplacas.com.br / wdapi2.com.br)
 * - Sem token (dev) → usa dados mock para testes locais
 *
 * @module plate-lookup-service
 */
import type { PlateLookupResult } from '../../domain/types.js';
import { isValidBrazilianPlate } from '../../domain/constants.js';

/** Timeout para chamadas externas (8s). */
const FETCH_TIMEOUT_MS = 8_000;

/** URL base da API de consulta de placas (APIPlacas / WD API). */
const API_PLACAS_BASE_URL = 'https://wdapi2.com.br/consulta';

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
 * Dados mock de veículos para desenvolvimento local.
 * Usados quando PLATE_LOOKUP_TOKEN não está configurado.
 */
const MOCK_VEHICLES: Record<string, PlateLookupResult> = {
  ABC1D23: { brand: 'Fiat', model: 'Argo', year: 2022, color: 'Branco' },
  BRA2E19: { brand: 'Volkswagen', model: 'Gol', year: 2020, color: 'Prata' },
  XYZ9A87: { brand: 'Chevrolet', model: 'Onix', year: 2023, color: 'Preto' },
  FLD6G61: { brand: 'Toyota', model: 'Corolla', year: 2021, color: 'Cinza' },
  INT8C36: { brand: 'Volkswagen', model: 'Crossfox', year: 2007, color: 'Prata' },
  QRS4F56: { brand: 'Honda', model: 'Civic', year: 2019, color: 'Azul' },
  MNO3B78: { brand: 'Hyundai', model: 'HB20', year: 2024, color: 'Vermelho' },
  JKL5H90: { brand: 'Renault', model: 'Kwid', year: 2023, color: 'Branco' },
  GHI7J12: { brand: 'Ford', model: 'Ka', year: 2020, color: 'Prata' },
  DEF8K34: { brand: 'Jeep', model: 'Renegade', year: 2022, color: 'Preto' },
  FCU3J67: { brand: 'Nissan', model: 'Versa Unique', year: 2017, color: 'Prata' },
};

/**
 * Consulta dados de um veículo por placa.
 *
 * - Com `PLATE_LOOKUP_TOKEN` → consulta API real (apiplacas.com.br)
 * - Sem token → retorna dados mock (desenvolvimento)
 */
export async function lookupPlate(raw: string): Promise<PlateLookupResult | null> {
  const plate = normalizePlate(raw);
  if (!isValidBrazilianPlate(plate)) return null;

  const token = process.env['PLATE_LOOKUP_TOKEN'];
  if (!token) {
    return MOCK_VEHICLES[plate] ?? null;
  }

  return fetchFromApiPlacas(plate, token);
}

/**
 * Consulta a API real do APIPlacas (wdapi2.com.br).
 * Endpoint: GET https://wdapi2.com.br/consulta/{placa}/{token}
 */
async function fetchFromApiPlacas(
  plate: string,
  token: string,
): Promise<PlateLookupResult | null> {
  const url = `${API_PLACAS_BASE_URL}/${plate}/${token}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, FETCH_TIMEOUT_MS);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const data = (await response.json()) as Record<string, unknown>;
    return parseApiPlacasResponse(data);
  } catch {
    return null;
  }
}

/**
 * Extrai dados do veículo da resposta da APIPlacas.
 *
 * Campos retornados pela API:
 * - MARCA, MODELO, ano, anoModelo, cor, municipio, uf, situacao
 */
function parseApiPlacasResponse(data: Record<string, unknown>): PlateLookupResult | null {
  const brand = extractString(data, ['MARCA', 'marca']);
  const model = extractString(data, ['MODELO', 'modelo']);
  const yearRaw = data['anoModelo'] ?? data['ano'];
  const year =
    typeof yearRaw === 'number' ? yearRaw : Number.parseInt(String(yearRaw), 10) || null;
  const color = extractString(data, ['cor']);

  if (!brand && !model) return null;

  return {
    brand: brand ? capitalizeWords(brand) : '',
    model: model ? capitalizeWords(model) : '',
    year,
    color: color ? capitalizeWords(color) : null,
  };
}

/** Tenta extrair uma string de múltiplas chaves possíveis. */
function extractString(data: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'string' && value.trim().length > 0) return value;
  }
  return '';
}
