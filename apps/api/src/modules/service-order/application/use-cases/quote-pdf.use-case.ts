/**
 * Use case para geração de PDF de orçamento.
 * Busca a ordem completa pelo token e gera o buffer PDF.
 * @module quote-pdf-use-case
 */
import { ServiceOrderRepository } from '../../infrastructure/repositories/service-order.repository.js';
import { generateQuotePdf } from '../../infrastructure/services/pdf-generator.service.js';

/** Use case: gera o PDF de orçamento a partir do token público. */
export class GenerateQuotePdfUseCase {
  constructor(private readonly repo: ServiceOrderRepository) {}

  /** Retorna o buffer PDF ou null se a ordem não existir. */
  async execute(
    token: string,
    issuedByName: string | null,
  ): Promise<{ buffer: Buffer; filename: string } | null> {
    const order = await this.repo.findByPublicTokenForQuote(token);
    if (!order) return null;

    const buffer = await generateQuotePdf(order, issuedByName);
    const sanitized = order.description.replaceAll(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
    const filename = `orcamento_${sanitized}_${token}.pdf`;

    return { buffer, filename };
  }
}

/** Use case: expira orçamentos DRAFT com mais de 30 dias. */
export class ExpireStaleQuotesUseCase {
  constructor(private readonly repo: ServiceOrderRepository) {}

  /** Retorna a quantidade de ordens expiradas. */
  async execute(): Promise<number> {
    return this.repo.expireStaleQuotes();
  }
}
