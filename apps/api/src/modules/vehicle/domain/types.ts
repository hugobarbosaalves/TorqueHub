/**
 * Tipos e interfaces do módulo de veículos.
 * @module vehicle-types
 */

/** Resultado do lookup de placa de veículo. */
export interface PlateLookupResult {
  readonly brand: string;
  readonly model: string;
  readonly year: number | null;
  readonly color: string | null;
}

/** Porta para o serviço de lookup de placa. */
export interface PlateLookupPort {
  /** Consulta dados de veículo por placa. Retorna null se não encontrado. */
  lookup(plate: string): Promise<PlateLookupResult | null>;
}
