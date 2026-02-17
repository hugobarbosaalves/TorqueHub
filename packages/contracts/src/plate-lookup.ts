/**
 * Dados retornados pelo lookup de placa de veículo.
 * @module contracts
 */
export interface PlateLookupResult {
  readonly brand: string;
  readonly model: string;
  readonly year: number | null;
  readonly color: string | null;
}
