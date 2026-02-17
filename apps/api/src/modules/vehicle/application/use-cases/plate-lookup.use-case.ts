/**
 * Use case para busca de dados de veículo por placa.
 * Delega para o serviço de lookup via porta.
 * @module plate-lookup-use-case
 */
import type { PlateLookupResult, PlateLookupPort } from '../../domain/types.js';

/** Busca informações de um veículo pela placa brasileira. */
export class PlateLookupUseCase {
  private readonly lookupPort: PlateLookupPort;

  constructor(lookupPort: PlateLookupPort) {
    this.lookupPort = lookupPort;
  }

  /** Executa a consulta de placa. Retorna null se não encontrado. */
  async execute(plate: string): Promise<PlateLookupResult | null> {
    return this.lookupPort.lookup(plate);
  }
}
