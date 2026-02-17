/**
 * Schemas Swagger para rotas de orçamento PDF.
 * @module quote-pdf-schemas
 */
import { errorResponse } from '../../../../shared/interfaces/schemas.js';

/** Schema: download do PDF de orçamento pelo token público. */
export const downloadQuotePdfSchema = {
  tags: ['Public'],
  summary: 'Download do PDF de orçamento pelo token público',
  description:
    'Gera e retorna o PDF do orçamento de serviço vinculado ao token. Público, sem autenticação.',
  params: {
    type: 'object' as const,
    properties: {
      token: { type: 'string', description: 'Token público da ordem' },
    },
    required: ['token'],
  },
  response: {
    200: {
      description: 'PDF binário do orçamento',
      type: 'string',
      format: 'binary',
    },
    404: errorResponse,
  },
};
