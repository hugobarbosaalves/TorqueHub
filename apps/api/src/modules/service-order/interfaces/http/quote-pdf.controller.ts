/**
 * Controller para rotas públicas de PDF de orçamento.
 * Permite download sem autenticação via token público.
 * @module quote-pdf-controller
 */
import type { FastifyInstance } from 'fastify';
import { prisma } from '../../../../shared/infrastructure/database/prisma.js';
import { ServiceOrderRepository } from '../../infrastructure/repositories/service-order.repository.js';
import { GenerateQuotePdfUseCase } from '../../application/use-cases/quote-pdf.use-case.js';
import { downloadQuotePdfSchema } from './quote-pdf.schemas.js';

const repo = new ServiceOrderRepository(prisma);
const generatePdfUseCase = new GenerateQuotePdfUseCase(repo);

/** Registra rotas públicas de download de PDF de orçamento. */
export function quotePdfRoutes(app: FastifyInstance): void {
  /** Gera e retorna o PDF do orçamento pelo token público. */
  app.get<{ Params: { token: string } }>(
    '/:token/pdf',
    { schema: downloadQuotePdfSchema },
    async (request, reply) => {
      const result = await generatePdfUseCase.execute(request.params.token, null);

      if (!result) {
        return reply.status(404).send({
          success: false,
          data: undefined as never,
          meta: { error: 'Ordem não encontrada para gerar PDF.' },
        });
      }

      return reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', `attachment; filename="${result.filename}"`)
        .send(result.buffer);
    },
  );
}
